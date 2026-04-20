from datetime import datetime, timezone, timedelta
from functools import wraps

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models import User, OTPLog, Device

admin_bp = Blueprint('admin', __name__)


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = User.query.get(int(get_jwt_identity()))
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


# ── GET /api/admin/stats ─────────────────────────────────
@admin_bp.route('/stats', methods=['GET'])
@admin_required
def stats():
    now  = datetime.now(timezone.utc)
    day1 = now - timedelta(days=1)
    prev = now - timedelta(days=2)

    total_users   = User.query.count()
    mfa_users     = User.query.filter_by(mfa_enabled=True).count()
    logins_today  = OTPLog.query.filter(OTPLog.timestamp >= day1).count()
    logins_prev   = OTPLog.query.filter(OTPLog.timestamp >= prev, OTPLog.timestamp < day1).count()
    failed_today  = OTPLog.query.filter(OTPLog.timestamp >= day1, OTPLog.status == 'failed').count()
    failed_prev   = OTPLog.query.filter(OTPLog.timestamp >= prev, OTPLog.timestamp < day1, OTPLog.status == 'failed').count()

    def pct_change(curr, prev):
        if prev == 0: return f'+{curr}' if curr else '0'
        change = round((curr - prev) / prev * 100)
        return f'+{change}%' if change >= 0 else f'{change}%'

    mfa_pct  = round(mfa_users / total_users * 100 if total_users else 0, 1)
    disabled = total_users - mfa_users

    return jsonify({
        'stats': [
            {'icon': '👥', 'label': 'Total Users',     'val': str(total_users),  'change': None,                          'up': True},
            {'icon': '🔐', 'label': 'MFA Enabled',     'val': str(mfa_users),    'change': f'{mfa_pct}%',                 'up': True},
            {'icon': '✅', 'label': 'Logins Today',    'val': str(logins_today), 'change': pct_change(logins_today, logins_prev), 'up': logins_today >= logins_prev},
            {'icon': '❌', 'label': 'Failed Attempts', 'val': str(failed_today), 'change': pct_change(failed_today, failed_prev), 'up': failed_today <= failed_prev},
        ],
        'mfa_adoption': {
            'pct':      mfa_pct,
            'enabled':  mfa_users,
            'disabled': disabled,
        }
    }), 200


# ── GET /api/admin/analytics ──────────────────────────────
@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def analytics():
    now  = datetime.now(timezone.utc)
    day7 = now - timedelta(days=7)
    day1 = now - timedelta(days=1)

    logins_7d   = OTPLog.query.filter(OTPLog.timestamp >= day7).count()
    verified_7d = OTPLog.query.filter(OTPLog.timestamp >= day7, OTPLog.status == 'verified').count()
    total_7d    = OTPLog.query.filter(OTPLog.timestamp >= day7).count()
    otps_sent   = OTPLog.query.filter(OTPLog.timestamp >= day7).count()

    # Chart — last 7 days
    login_chart = []
    for i in range(6, -1, -1):
        ds = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        de = ds + timedelta(days=1)
        login_chart.append({
            'day':    ds.strftime('%a'),
            'logins': OTPLog.query.filter(OTPLog.timestamp >= ds, OTPLog.timestamp < de, OTPLog.status == 'verified').count(),
            'failed': OTPLog.query.filter(OTPLog.timestamp >= ds, OTPLog.timestamp < de, OTPLog.status == 'failed').count(),
        })

    # OTP method breakdown
    method_rows = (
        db.session.query(OTPLog.method, func.count(OTPLog.id))
        .filter(OTPLog.timestamp >= day7)
        .group_by(OTPLog.method).all()
    )
    method_total = sum(c for _, c in method_rows) or 1
    colors = {'email': 'var(--blue)', 'sms': 'var(--green)', 'totp': '#facc15', 'backup': '#f87171'}
    otp_methods = [
        {'label': m.capitalize() + ' OTP' if m in ('email','sms') else 'Authenticator' if m == 'totp' else m.capitalize(),
         'pct': round(c / method_total * 100), 'color': colors.get(m, 'var(--text)')} 
        for m, c in method_rows
    ]

    # MFA rate for donut centre
    total_users = User.query.count()
    mfa_users   = User.query.filter_by(mfa_enabled=True).count()
    mfa_rate    = round(mfa_users / total_users * 100 if total_users else 0, 1)

    # Locations
    loc_rows = (
        db.session.query(Device.location, func.count(Device.id))
        .group_by(Device.location).order_by(func.count(Device.id).desc()).limit(5).all()
    )
    total_devices = Device.query.count() or 1
    locations = [
        {'country': l or 'Unknown', 'logins': c, 'pct': round(c / total_devices * 100)}
        for l, c in loc_rows
    ]

    return jsonify({
        'chart_period': 'Last 7 Days',
        'login_chart':  login_chart,
        'otp_methods':  otp_methods,
        'mfa_rate':     mfa_rate,
        'locations':    locations,
        'summary': [
            {'icon': '📊', 'label': 'Total Logins (7d)',   'val': str(logins_7d)},
            {'icon': '📨', 'label': 'OTPs Sent (7d)',      'val': str(otps_sent)},
            {'icon': '✅', 'label': 'OTP Success Rate',    'val': f"{round(verified_7d / total_7d * 100 if total_7d else 0, 1)}%"},
            {'icon': '⚡', 'label': 'Avg OTP Delivery',   'val': '~2s'},
        ]
    }), 200


# ── GET /api/admin/alerts ─────────────────────────────────
@admin_bp.route('/alerts', methods=['GET'])
@admin_required
def get_alerts():
    now      = datetime.now(timezone.utc)
    one_hour = now - timedelta(hours=1)
    one_day  = now - timedelta(days=1)

    alerts = []

    # Suspicious IPs — 3+ failed attempts in last hour
    suspicious = (
        db.session.query(OTPLog.ip_address, func.count(OTPLog.id).label('cnt'))
        .filter(OTPLog.status == 'failed', OTPLog.timestamp >= one_hour)
        .group_by(OTPLog.ip_address)
        .having(func.count(OTPLog.id) >= 3)
        .order_by(func.count(OTPLog.id).desc()).all()
    )
    for ip, cnt in suspicious:
        alerts.append({
            'id': f'sus_{ip}', 'type': 'danger', 'icon': '🚨',
            'msg': f'{cnt} failed login attempts from {ip} in the last hour',
            'time': 'Last hour'
        })

    # Users without MFA
    no_mfa = User.query.filter_by(mfa_enabled=False, is_active=True, role='user').count()
    if no_mfa:
        alerts.append({
            'id': 'no_mfa', 'type': 'warning', 'icon': '⚠️',
            'msg': f'{no_mfa} active users have not enabled MFA — accounts at risk',
            'time': 'Now'
        })

    # New devices in last 24h
    new_devices = Device.query.filter(Device.created_at >= one_day, Device.trusted == False).count()
    if new_devices:
        alerts.append({
            'id': 'new_devices', 'type': 'info', 'icon': '📍',
            'msg': f'{new_devices} new unrecognised device(s) detected in the last 24 hours',
            'time': 'Last 24h'
        })

    # MFA adoption milestone
    total = User.query.filter_by(role='user').count()
    mfa   = User.query.filter_by(mfa_enabled=True, role='user').count()
    if total:
        pct = round(mfa / total * 100)
        alerts.append({
            'id': 'mfa_rate', 'type': 'success', 'icon': '✅',
            'msg': f'MFA adoption rate is {pct}% ({mfa}/{total} users)',
            'time': 'Today'
        })

    return jsonify({'alerts': alerts}), 200


# ── PUT /api/admin/alerts/<id>/dismiss ────────────────────
@admin_bp.route('/alerts/<string:alert_id>/dismiss', methods=['PUT'])
@admin_required
def dismiss_alert(alert_id):
    return jsonify({'message': 'Alert dismissed'}), 200


# ── PUT /api/admin/users/<id>/status ─────────────────────
@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@admin_required
def update_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data   = request.get_json() or {}
    status = data.get('status')
    if status == 'active':   user.is_active = True
    if status == 'inactive': user.is_active = False
    db.session.commit()
    return jsonify({'message': 'Status updated', 'user': user.to_dict()}), 200


# ── POST /api/admin/users/<id>/reset-mfa ─────────────────
@admin_bp.route('/users/<int:user_id>/reset-mfa', methods=['POST'])
@admin_required
def reset_user_mfa(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.mfa_enabled = False
    user.mfa_secret  = None
    user.mfa_method  = 'email'
    db.session.commit()
    return jsonify({'message': 'MFA reset successfully'}), 200


# ── GET /api/admin/users ──────────────────────────────────
@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search   = request.args.get('search', '')

    query = User.query
    if search:
        query = query.filter(User.email.ilike(f'%{search}%') | User.full_name.ilike(f'%{search}%'))

    paginated = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    # Attach login count per user
    users_data = []
    for u in paginated.items:
        d = u.to_dict()
        d['login_count'] = OTPLog.query.filter_by(user_id=u.id, status='verified').count()
        d['failed_count'] = OTPLog.query.filter_by(user_id=u.id, status='failed').count()
        users_data.append(d)

    return jsonify({'users': users_data, 'total': paginated.total, 'pages': paginated.pages, 'page': page}), 200


# ── PUT /api/admin/users/<id> ─────────────────────────────
@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json() or {}
    if 'is_active' in data: user.is_active = bool(data['is_active'])
    if 'role' in data and data['role'] in ('user', 'admin'): user.role = data['role']
    if 'plan' in data: user.plan = data['plan']
    if 'mfa_enabled' in data: user.mfa_enabled = bool(data['mfa_enabled'])
    db.session.commit()
    return jsonify({'message': 'User updated', 'user': user.to_dict()}), 200


# ── DELETE /api/admin/users/<id> ──────────────────────────
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    me = User.query.get(int(get_jwt_identity()))
    if user_id == me.id:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200


# ── GET /api/admin/logs ───────────────────────────────────
@admin_bp.route('/logs', methods=['GET'])
@admin_required
def get_logs():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    status   = request.args.get('status')
    method   = request.args.get('method')

    query = OTPLog.query
    if status: query = query.filter_by(status=status)
    if method: query = query.filter_by(method=method)

    paginated = query.order_by(OTPLog.timestamp.desc()).paginate(page=page, per_page=per_page, error_out=False)

    logs_data = []
    for l in paginated.items:
        d = l.to_dict()
        u = User.query.get(l.user_id)
        d['user_email'] = u.email if u else 'deleted'
        logs_data.append(d)

    return jsonify({'logs': logs_data, 'total': paginated.total, 'pages': paginated.pages, 'page': page}), 200


# ── GET /api/admin/devices ────────────────────────────────
@admin_bp.route('/devices', methods=['GET'])
@admin_required
def get_devices():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    paginated = Device.query.order_by(Device.last_seen.desc()).paginate(page=page, per_page=per_page, error_out=False)

    devices_data = []
    for d in paginated.items:
        dd = d.to_dict()
        u = User.query.get(d.user_id)
        dd['user_email'] = u.email if u else 'deleted'
        devices_data.append(dd)

    return jsonify({'devices': devices_data, 'total': paginated.total, 'pages': paginated.pages, 'page': page}), 200


# ── GET /api/admin/suspicious ─────────────────────────────
@admin_bp.route('/suspicious', methods=['GET'])
@admin_required
def suspicious_activity():
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    results = (
        db.session.query(OTPLog.ip_address, func.count(OTPLog.id).label('count'))
        .filter(OTPLog.status == 'failed', OTPLog.timestamp >= one_hour_ago)
        .group_by(OTPLog.ip_address)
        .having(func.count(OTPLog.id) >= 3)
        .order_by(func.count(OTPLog.id).desc()).all()
    )
    return jsonify({'suspicious_ips': [{'ip': ip, 'failed_attempts': c} for ip, c in results]}), 200
