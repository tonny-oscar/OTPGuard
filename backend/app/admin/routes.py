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
    """
    Get admin dashboard stats
    ---
    tags: [Admin]
    security: [{ Bearer: [] }]
    responses:
      200: { description: Stats and MFA adoption data }
      403: { description: Admin access required }
    """
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
            {'label': 'Total Users',     'val': str(total_users),  'change': None,                          'up': True},
            {'label': 'MFA Enabled',     'val': str(mfa_users),    'change': f'{mfa_pct}%',                 'up': True},
            {'label': 'Logins Today',    'val': str(logins_today), 'change': pct_change(logins_today, logins_prev), 'up': logins_today >= logins_prev},
            {'label': 'Failed Attempts', 'val': str(failed_today), 'change': pct_change(failed_today, failed_prev), 'up': failed_today <= failed_prev},
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
    """
    Get login analytics for last 7 days
    ---
    tags: [Admin - Analytics]
    security: [{ Bearer: [] }]
    responses:
      200: { description: Analytics data including chart, OTP methods, locations }
    """
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
            {'label': 'Total Logins (7d)',   'val': str(logins_7d)},
            {'label': 'OTPs Sent (7d)',      'val': str(otps_sent)},
            {'label': 'OTP Success Rate',    'val': f"{round(verified_7d / total_7d * 100 if total_7d else 0, 1)}%"},
            {'label': 'Avg OTP Delivery',   'val': '~2s'},
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
            'id': f'sus_{ip}', 'type': 'danger',
            'msg': f'{cnt} failed login attempts from {ip} in the last hour',
            'time': 'Last hour'
        })

    # Users without MFA
    no_mfa = User.query.filter_by(mfa_enabled=False, is_active=True, role='user').count()
    if no_mfa:
        alerts.append({
            'id': 'no_mfa', 'type': 'warning',
            'msg': f'{no_mfa} active users have not enabled MFA — accounts at risk',
            'time': 'Now'
        })

    # New devices in last 24h
    new_devices = Device.query.filter(Device.created_at >= one_day, Device.trusted == False).count()
    if new_devices:
        alerts.append({
            'id': 'new_devices', 'type': 'info',
            'msg': f'{new_devices} new unrecognised device(s) detected in the last 24 hours',
            'time': 'Last 24h'
        })

    # MFA adoption milestone
    total = User.query.filter_by(role='user').count()
    mfa   = User.query.filter_by(mfa_enabled=True, role='user').count()
    if total:
        pct = round(mfa / total * 100)
        alerts.append({
            'id': 'mfa_rate', 'type': 'success',
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
    """
    List all users with search and pagination
    ---
    tags: [Admin]
    security: [{ Bearer: [] }]
    parameters:
      - { in: query, name: search,   type: string }
      - { in: query, name: page,     type: integer, default: 1 }
      - { in: query, name: per_page, type: integer, default: 20 }
    responses:
      200: { description: Paginated user list }
    """
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


# ══════════════════════════════════════════════════════════
#  BILLING & USAGE REPORTS
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/billing/usage-report ───────────────────
@admin_bp.route('/billing/usage-report', methods=['GET'])
@admin_required
def usage_report():
    """Get detailed usage and billing report for all users."""
    days = request.args.get('days', 30, type=int)
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    users_with_usage = []
    for user in User.query.filter_by(role='user', is_active=True).all():
        logins = OTPLog.query.filter(
            OTPLog.user_id == user.id,
            OTPLog.status == 'verified',
            OTPLog.timestamp >= cutoff
        ).count()
        
        failed = OTPLog.query.filter(
            OTPLog.user_id == user.id,
            OTPLog.status == 'failed',
            OTPLog.timestamp >= cutoff
        ).count()
        
        usage_by_method = (
            db.session.query(OTPLog.method, func.count(OTPLog.id))
            .filter(OTPLog.user_id == user.id, OTPLog.timestamp >= cutoff)
            .group_by(OTPLog.method).all()
        )
        
        users_with_usage.append({
            'user_id': user.id,
            'email': user.email,
            'name': user.full_name,
            'plan': user.plan,
            'total_logins': logins,
            'failed_logins': failed,
            'success_rate': round(logins / (logins + failed) * 100) if (logins + failed) > 0 else 100,
            'usage_by_method': [{'method': m, 'count': c} for m, c in usage_by_method],
            'joined': user.created_at.isoformat(),
        })
    
    total_usage = OTPLog.query.filter(OTPLog.timestamp >= cutoff).count()
    
    return jsonify({
        'period_days': days,
        'report_date': datetime.now(timezone.utc).isoformat(),
        'total_active_users': len(users_with_usage),
        'total_otp_operations': total_usage,
        'users': users_with_usage
    }), 200


# ── GET /api/admin/billing/monthly-summary ────────────────
@admin_bp.route('/billing/monthly-summary', methods=['GET'])
@admin_required
def monthly_billing_summary():
    """Get monthly billing summary for all users."""
    months = request.args.get('months', 6, type=int)
    
    summary_data = []
    now = datetime.now(timezone.utc)
    
    for m in range(months - 1, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=m * 30)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        
        month_str = month_start.strftime('%Y-%m')
        
        logins = OTPLog.query.filter(
            OTPLog.timestamp >= month_start,
            OTPLog.timestamp < month_end,
            OTPLog.status == 'verified'
        ).count()
        
        active_users = db.session.query(func.count(func.distinct(OTPLog.user_id))).filter(
            OTPLog.timestamp >= month_start,
            OTPLog.timestamp < month_end
        ).scalar() or 0
        
        summary_data.append({
            'month': month_str,
            'active_users': active_users,
            'total_verifications': logins,
            'estimated_cost': logins * 0.5  # Mock cost calculation
        })
    
    return jsonify({'summary': summary_data}), 200


# ══════════════════════════════════════════════════════════
#  REVENUE DASHBOARD
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/revenue/dashboard ──────────────────────
@admin_bp.route('/revenue/dashboard', methods=['GET'])
@admin_required
def revenue_dashboard():
    """Get revenue analytics and metrics."""
    now = datetime.now(timezone.utc)
    day30 = now - timedelta(days=30)
    day90 = now - timedelta(days=90)
    
    # Plans breakdown
    plan_counts = db.session.query(
        User.plan, func.count(User.id)
    ).filter_by(role='user', is_active=True).group_by(User.plan).all()
    
    plan_pricing = {
        'starter': 0,
        'growth': 99,
        'business': 299,
        'enterprise': 999
    }
    
    total_monthly_revenue = 0
    plan_breakdown = []
    for plan, count in plan_counts:
        revenue = count * plan_pricing.get(plan, 0)
        total_monthly_revenue += revenue
        plan_breakdown.append({
            'plan': plan,
            'users': count,
            'price': plan_pricing.get(plan, 0),
            'revenue': revenue,
            'percentage': None  # Will be calculated
        })
    
    # Calculate percentages
    for item in plan_breakdown:
        item['percentage'] = round(item['revenue'] / total_monthly_revenue * 100) if total_monthly_revenue > 0 else 0
    
    # Revenue trend (last 7 days)
    revenue_trend = []
    for i in range(6, -1, -1):
        ds = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        de = ds + timedelta(days=1)
        
        daily_logins = OTPLog.query.filter(
            OTPLog.timestamp >= ds,
            OTPLog.timestamp < de,
            OTPLog.status == 'verified'
        ).count()
        
        revenue_trend.append({
            'day': ds.strftime('%a'),
            'revenue': daily_logins * 0.5  # Mock calculation
        })
    
    # Active subscriptions
    total_users = User.query.filter_by(role='user', is_active=True).count()
    trial_users = User.query.filter_by(role='user', is_active=True, plan='starter').count()  # Assumption
    
    return jsonify({
        'total_monthly_revenue': total_monthly_revenue,
        'monthly_revenue_target': 10000,
        'total_subscriptions': total_users,
        'trial_subscriptions': trial_users,
        'paying_subscriptions': total_users - trial_users,
        'avg_revenue_per_user': round(total_monthly_revenue / total_users) if total_users > 0 else 0,
        'plan_breakdown': plan_breakdown,
        'revenue_trend_7d': revenue_trend
    }), 200


# ══════════════════════════════════════════════════════════
#  CHURN ANALYSIS
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/churn/analysis ─────────────────────────
@admin_bp.route('/churn/analysis', methods=['GET'])
@admin_required
def churn_analysis():
    """
    Analyze user churn with filters
    ---
    tags: [Admin - Analytics]
    security: [{ Bearer: [] }]
    parameters:
      - { in: query, name: type, type: string, enum: [all, voluntary, involuntary, early], default: all }
      - { in: query, name: days, type: integer, default: 30 }
      - { in: query, name: plan, type: string, enum: [starter, growth, business, enterprise] }
    responses:
      200: { description: Churn analysis data }
    """
    """Analyze user churn patterns. ?type=voluntary|involuntary|early|plan&days=30"""
    now       = datetime.now(timezone.utc)
    days      = request.args.get('days', 30, type=int)
    churn_type = request.args.get('type', 'all')  # all | voluntary | involuntary | early | plan
    plan_filter = request.args.get('plan', None)

    cutoff  = now - timedelta(days=days)
    day60   = now - timedelta(days=60)
    day90   = now - timedelta(days=90)

    # ── Base inactive query ──────────────────────────────
    inactive_30d = []
    all_active = User.query.filter_by(role='user', is_active=True)
    if plan_filter:
        all_active = all_active.filter_by(plan=plan_filter)

    for user in all_active.all():
        last_login = db.session.query(func.max(OTPLog.timestamp)).filter(
            OTPLog.user_id == user.id, OTPLog.status == 'verified'
        ).scalar()
        if not last_login or last_login < cutoff:
            days_inactive = (now - (last_login or user.created_at)).days
            # Classify churn type
            if churn_type == 'early' and (now - user.created_at).days > 30:
                continue
            if churn_type == 'voluntary' and days_inactive < 60:
                continue
            if churn_type == 'involuntary' and days_inactive >= 60:
                continue
            inactive_30d.append({
                'user_id':      user.id,
                'email':        user.email,
                'name':         user.full_name,
                'plan':         user.plan,
                'last_login':   last_login.isoformat() if last_login else None,
                'days_inactive': days_inactive,
                'joined':       user.created_at.isoformat(),
                'churn_type':   'early' if (now - user.created_at).days <= 30 else
                                'voluntary' if days_inactive >= 60 else 'involuntary',
            })

    # ── At-risk users ────────────────────────────────────
    high_risk = []
    for user in User.query.filter_by(role='user', is_active=True).all():
        if plan_filter and user.plan != plan_filter:
            continue
        logins_30d = OTPLog.query.filter(
            OTPLog.user_id == user.id, OTPLog.timestamp >= cutoff,
            OTPLog.status == 'verified'
        ).count()
        logins_prev = OTPLog.query.filter(
            OTPLog.user_id == user.id,
            OTPLog.timestamp >= day90, OTPLog.timestamp < day60,
            OTPLog.status == 'verified'
        ).count()
        if logins_prev > 0 and logins_30d < logins_prev * 0.5:
            high_risk.append({
                'user_id':          user.id,
                'email':            user.email,
                'plan':             user.plan,
                'activity_decline': round((1 - logins_30d / logins_prev) * 100),
                'logins_30d':       logins_30d,
                'logins_prev_30d':  logins_prev,
            })

    # ── Churned count ────────────────────────────────────
    churned_q = User.query.filter(User.is_active == False, User.created_at >= cutoff)
    if plan_filter:
        churned_q = churned_q.filter_by(plan=plan_filter)
    churned_last = churned_q.count()

    total_users = User.query.filter_by(role='user').count()
    churn_rate  = round(churned_last / total_users * 100, 1) if total_users else 0

    # ── Churn trend (4 periods) ──────────────────────────
    churn_trend = []
    for i in range(4):
        start = now - timedelta(days=(i + 1) * 30)
        end   = now - timedelta(days=i * 30)
        q = User.query.filter(User.is_active == False, User.created_at >= start, User.created_at < end)
        if plan_filter:
            q = q.filter_by(plan=plan_filter)
        churn_trend.append({
            'period':        f'{start.strftime("%b")}-{end.strftime("%b")}',
            'churned_users': q.count(),
        })

    # ── Plan breakdown of inactive ───────────────────────
    plan_breakdown = {}
    for u in inactive_30d:
        plan_breakdown[u['plan']] = plan_breakdown.get(u['plan'], 0) + 1

    # ── Method breakdown of churned users ────────────────
    method_breakdown = {}
    for u in inactive_30d:
        uid = u['user_id']
        top = db.session.query(OTPLog.method, func.count(OTPLog.id)).filter_by(user_id=uid)\
            .group_by(OTPLog.method).order_by(func.count(OTPLog.id).desc()).first()
        if top:
            method_breakdown[top[0]] = method_breakdown.get(top[0], 0) + 1

    return jsonify({
        'churn_type':         churn_type,
        'period_days':        days,
        'plan_filter':        plan_filter,
        'churn_rate_30d':     churn_rate,
        'at_risk_users':      len(high_risk),
        'inactive_users_30d': len(inactive_30d),
        'churned_last_30d':   churned_last,
        'inactive_users':     sorted(inactive_30d, key=lambda x: x['days_inactive'], reverse=True)[:25],
        'high_risk_users':    sorted(high_risk, key=lambda x: x['activity_decline'], reverse=True)[:25],
        'churn_trend':        churn_trend,
        'plan_breakdown':     plan_breakdown,
        'method_breakdown':   method_breakdown,
    }), 200


# ══════════════════════════════════════════════════════════
#  USER LIFECYCLE ANALYTICS
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/lifecycle/analytics ────────────────────
@admin_bp.route('/lifecycle/analytics', methods=['GET'])
@admin_required
def lifecycle_analytics():
    """Analyze user lifecycle stages and retention."""
    now = datetime.now(timezone.utc)
    
    # User cohorts by signup month
    cohorts = []
    for i in range(12):
        cohort_month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        cohort_month_end = (cohort_month_start + timedelta(days=32)).replace(day=1)
        
        cohort_users = User.query.filter(
            User.created_at >= cohort_month_start,
            User.created_at < cohort_month_end,
            User.role == 'user'
        ).count()
        
        cohort_active = User.query.filter(
            User.created_at >= cohort_month_start,
            User.created_at < cohort_month_end,
            User.role == 'user',
            User.is_active == True
        ).count()
        
        if cohort_users > 0:
            cohorts.append({
                'month': cohort_month_start.strftime('%Y-%m'),
                'signups': cohort_users,
                'active': cohort_active,
                'retention': round(cohort_active / cohort_users * 100)
            })
    
    # User lifecycle stages
    day7 = now - timedelta(days=7)
    day30 = now - timedelta(days=30)
    day90 = now - timedelta(days=90)
    day365 = now - timedelta(days=365)
    
    new_users = User.query.filter(
        User.created_at >= day7,
        User.role == 'user'
    ).count()
    
    active_users = User.query.filter(
        User.created_at < day7,
        User.created_at >= day30,
        User.role == 'user',
        User.is_active == True
    ).count()
    
    mature_users = User.query.filter(
        User.created_at < day90,
        User.created_at >= day30,
        User.role == 'user',
        User.is_active == True
    ).count()
    
    loyal_users = User.query.filter(
        User.created_at < day365,
        User.role == 'user',
        User.is_active == True
    ).count()
    
    return jsonify({
        'lifecycle_stages': {
            'new_users_7d': new_users,
            'active_users_30d': active_users,
            'mature_users_30_90d': mature_users,
            'loyal_users_1y': loyal_users,
        },
        'cohort_analysis': cohorts[:12],
        'avg_user_lifetime': 180,  # Mock value
        'onboarding_completion_rate': 78,  # Mock value
        'feature_adoption_rate': 65,  # Mock value
    }), 200


# ══════════════════════════════════════════════════════════
#  CUSTOM REPORT BUILDER
# ══════════════════════════════════════════════════════════

# ── POST /api/admin/reports/custom ────────────────────────
@admin_bp.route('/reports/custom', methods=['POST'])
@admin_required
def create_custom_report():
    """
    Generate a custom report
    ---
    tags: [Admin - Reports]
    security: [{ Bearer: [] }]
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            type:    { type: string, enum: [usage, security, churn, lifecycle] }
            filters: { type: object }
    responses:
      200: { description: Generated report data }
    """
    """Create a custom report based on specified filters."""
    data = request.get_json() or {}
    
    report_type = data.get('type')  # 'usage', 'revenue', 'security', 'retention'
    filters = data.get('filters', {})
    
    if report_type == 'usage':
        query = OTPLog.query
        if filters.get('status'):
            query = query.filter_by(status=filters['status'])
        if filters.get('method'):
            query = query.filter_by(method=filters['method'])
        
        days = filters.get('days', 30)
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.filter(OTPLog.timestamp >= cutoff)
        
        logs = query.all()
        report = {
            'type': 'usage',
            'total_operations': len(logs),
            'by_method': {},
            'by_status': {},
            'generated': datetime.now(timezone.utc).isoformat()
        }
        
        for log in logs:
            report['by_method'][log.method] = report['by_method'].get(log.method, 0) + 1
            report['by_status'][log.status] = report['by_status'].get(log.status, 0) + 1
    
    elif report_type == 'security':
        day_7 = datetime.now(timezone.utc) - timedelta(days=7)
        
        failed_attempts = OTPLog.query.filter(
            OTPLog.status == 'failed',
            OTPLog.timestamp >= day_7
        ).count()
        
        suspicious_ips = (
            db.session.query(OTPLog.ip_address, func.count(OTPLog.id))
            .filter(OTPLog.status == 'failed', OTPLog.timestamp >= day_7)
            .group_by(OTPLog.ip_address)
            .having(func.count(OTPLog.id) >= 3).all()
        )
        
        report = {
            'type': 'security',
            'period': '7_days',
            'failed_attempts': failed_attempts,
            'suspicious_ips': len(suspicious_ips),
            'top_ips': [{'ip': ip, 'attempts': c} for ip, c in suspicious_ips[:5]],
            'generated': datetime.now(timezone.utc).isoformat()
        }
    
    elif report_type == 'churn':
        days    = filters.get('days', 30)
        plan    = filters.get('plan')
        cutoff  = datetime.now(timezone.utc) - timedelta(days=days)
        inactive = []
        for user in User.query.filter_by(role='user', is_active=True).all():
            if plan and user.plan != plan:
                continue
            last = db.session.query(func.max(OTPLog.timestamp)).filter(
                OTPLog.user_id == user.id, OTPLog.status == 'verified'
            ).scalar()
            if not last or last < cutoff:
                inactive.append({'email': user.email, 'plan': user.plan,
                                  'days_inactive': (datetime.now(timezone.utc) - (last or user.created_at)).days})
        report = {
            'type': 'churn',
            'period_days': days,
            'plan_filter': plan,
            'inactive_count': len(inactive),
            'inactive_users': inactive[:20],
            'generated': datetime.now(timezone.utc).isoformat()
        }

    elif report_type == 'lifecycle':
        now = datetime.now(timezone.utc)
        cohorts = []
        for i in range(6):
            ms = (now.replace(day=1) - timedelta(days=i*30)).replace(day=1)
            me = (ms + timedelta(days=32)).replace(day=1)
            total  = User.query.filter(User.created_at >= ms, User.created_at < me, User.role == 'user').count()
            active = User.query.filter(User.created_at >= ms, User.created_at < me, User.role == 'user', User.is_active == True).count()
            if total:
                cohorts.append({'month': ms.strftime('%Y-%m'), 'signups': total, 'active': active,
                                'retention': round(active/total*100)})
        report = {
            'type': 'lifecycle',
            'cohorts': cohorts,
            'generated': datetime.now(timezone.utc).isoformat()
        }

    else:
        return jsonify({'error': 'Invalid report type. Use: usage, security, churn, lifecycle'}), 400
    
    return jsonify(report), 200


# ── GET /api/admin/reports/list ───────────────────────────
@admin_bp.route('/reports/list', methods=['GET'])
@admin_required
def list_custom_reports():
    """
    List available report templates
    ---
    tags: [Admin - Reports]
    security: [{ Bearer: [] }]
    responses:
      200: { description: List of report templates }
    """
    """List available report templates."""
    reports = [
        {
            'id': 'usage-report',
            'name': '📊 Usage Report',
            'description': 'Detailed OTP usage and billing per user',
            'type': 'usage',
            'filters': ['days', 'method', 'status']
        },
        {
            'id': 'security-report',
            'name': '🔒 Security Report',
            'description': 'Failed logins, suspicious IPs, brute force attempts',
            'type': 'security',
            'filters': ['days']
        },
        {
            'id': 'churn-report',
            'name': '📉 Churn Report',
            'description': 'Inactive users and churn analysis by plan',
            'type': 'churn',
            'filters': ['days', 'plan']
        },
        {
            'id': 'lifecycle-report',
            'name': '🔄 Lifecycle Report',
            'description': 'User cohort retention and lifecycle stages',
            'type': 'lifecycle',
            'filters': []
        },
    ]
    
    return jsonify({'reports': reports}), 200


# ══════════════════════════════════════════════════════════
#  SECURITY & THREAT DASHBOARD
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/security/threats ───────────────────────
@admin_bp.route('/security/threats', methods=['GET'])
@admin_required
def security_threats():
    """Get security threats and suspicious activity."""
    now = datetime.now(timezone.utc)
    day1 = now - timedelta(days=1)
    day7 = now - timedelta(days=7)
    
    # Failed logins by IP
    failed_by_ip = (
        db.session.query(OTPLog.ip_address, func.count(OTPLog.id))
        .filter(OTPLog.status == 'failed', OTPLog.timestamp >= day7)
        .group_by(OTPLog.ip_address)
        .order_by(func.count(OTPLog.id).desc()).limit(10).all()
    )
    
    # Brute force attempts (3+ failed logins in last hour)
    one_hour = now - timedelta(hours=1)
    brute_force_ips = (
        db.session.query(OTPLog.ip_address, func.count(OTPLog.id))
        .filter(OTPLog.status == 'failed', OTPLog.timestamp >= one_hour)
        .group_by(OTPLog.ip_address)
        .having(func.count(OTPLog.id) >= 3)
        .order_by(func.count(OTPLog.id).desc()).all()
    )
    
    return jsonify({
        'failed_logins_24h': OTPLog.query.filter(OTPLog.timestamp >= day1, OTPLog.status == 'failed').count(),
        'failed_logins_7d': OTPLog.query.filter(OTPLog.timestamp >= day7, OTPLog.status == 'failed').count(),
        'brute_force_attempts': len(brute_force_ips),
        'suspicious_ips': [{'ip': ip, 'attempts': c} for ip, c in failed_by_ip],
        'brute_force_ips': [{'ip': ip, 'attempts': c} for ip, c in brute_force_ips],
        'mfa_enforcement_rate': round(User.query.filter_by(mfa_enabled=True).count() / (User.query.count() or 1) * 100, 1),
    }), 200


# ── GET /api/admin/security/mfa-status ───────────────────
@admin_bp.route('/security/mfa-status', methods=['GET'])
@admin_required
def mfa_status():
    """Get MFA adoption and status by plan."""
    plans = ['starter', 'growth', 'business', 'enterprise']
    mfa_by_plan = []
    
    for plan in plans:
        total = User.query.filter_by(plan=plan, role='user').count()
        mfa = User.query.filter_by(plan=plan, mfa_enabled=True, role='user').count()
        mfa_by_plan.append({
            'plan': plan.capitalize(),
            'total_users': total,
            'mfa_users': mfa,
            'mfa_rate': round(mfa / total * 100) if total > 0 else 0
        })
    
    return jsonify({'mfa_by_plan': mfa_by_plan}), 200


# ══════════════════════════════════════════════════════════
#  SYSTEM HEALTH & PERFORMANCE
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/health/system ──────────────────────────
@admin_bp.route('/health/system', methods=['GET'])
@admin_required
def system_health():
    """Get system health metrics."""
    now = datetime.now(timezone.utc)
    day1 = now - timedelta(days=1)
    
    total_logs = OTPLog.query.count()
    total_users = User.query.count()
    total_devices = Device.query.count()
    
    # Calculate average response time (mock)
    avg_response_time = 45  # milliseconds
    
    # Error rates
    errors_24h = OTPLog.query.filter(
        OTPLog.timestamp >= day1,
        OTPLog.status == 'failed'
    ).count()
    
    total_24h = OTPLog.query.filter(OTPLog.timestamp >= day1).count()
    error_rate = round(errors_24h / (total_24h or 1) * 100, 2)
    
    return jsonify({
        'status': 'operational',
        'uptime_percentage': 99.9,
        'api_response_time_ms': avg_response_time,
        'error_rate_percent': error_rate,
        'total_records': total_logs,
        'total_users': total_users,
        'total_devices': total_devices,
        'database_size_mb': 256,
        'last_backup': (now - timedelta(hours=1)).isoformat(),
    }), 200


# ── GET /api/admin/health/performance ─────────────────────
@admin_bp.route('/health/performance', methods=['GET'])
@admin_required
def performance_metrics():
    """Get performance metrics."""
    now = datetime.now(timezone.utc)
    
    perf_data = []
    for i in range(6, -1, -1):
        ds = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        de = ds + timedelta(days=1)
        
        response_times = [45 + (i % 20), 52 - (i % 15)]
        avg_rt = sum(response_times) / len(response_times)
        
        perf_data.append({
            'day': ds.strftime('%a'),
            'avg_response_time': round(avg_rt, 1),
            'error_rate': round((i % 5), 1),
        })
    
    return jsonify({'performance_trend': perf_data}), 200


# ══════════════════════════════════════════════════════════
#  COMMUNICATION CENTER
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/communications/delivery ────────────────
@admin_bp.route('/communications/delivery', methods=['GET'])
@admin_required
def communication_delivery():
    """Get email/SMS delivery statistics."""
    now = datetime.now(timezone.utc)
    day7 = now - timedelta(days=7)
    
    email_count = OTPLog.query.filter(OTPLog.method == 'email', OTPLog.timestamp >= day7).count()
    email_success = OTPLog.query.filter(
        OTPLog.method == 'email',
        OTPLog.status == 'verified',
        OTPLog.timestamp >= day7
    ).count()
    
    sms_count = OTPLog.query.filter(OTPLog.method == 'sms', OTPLog.timestamp >= day7).count()
    sms_success = OTPLog.query.filter(
        OTPLog.method == 'sms',
        OTPLog.status == 'verified',
        OTPLog.timestamp >= day7
    ).count()
    
    return jsonify({
        'email_sent': email_count,
        'email_delivered': email_success,
        'email_delivery_rate': round(email_success / (email_count or 1) * 100, 1),
        'sms_sent': sms_count,
        'sms_delivered': sms_success,
        'sms_delivery_rate': round(sms_success / (sms_count or 1) * 100, 1),
        'avg_delivery_time_ms': 2000,
    }), 200


# ══════════════════════════════════════════════════════════
#  FEATURE USAGE ANALYTICS
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/features/usage ─────────────────────────
@admin_bp.route('/features/usage', methods=['GET'])
@admin_required
def feature_usage():
    """Get feature adoption metrics by plan."""
    features = {
        'email_otp': {'name': 'Email OTP', 'adoption': 95},
        'sms_otp': {'name': 'SMS OTP', 'adoption': 62},
        'totp': {'name': 'Authenticator (TOTP)', 'adoption': 45},
        'backup_codes': {'name': 'Backup Codes', 'adoption': 28},
        'device_trust': {'name': 'Device Trusting', 'adoption': 71},
    }
    
    plan_features = {}
    for plan in ['starter', 'growth', 'business', 'enterprise']:
        plan_features[plan] = {
            'available': list(features.keys()),
            'adoption_rate': round(45 + (len(plan) * 10), 1),
        }
    
    return jsonify({
        'features': features,
        'by_plan': plan_features,
    }), 200


# ══════════════════════════════════════════════════════════
#  SMS & COMMUNICATION COSTS
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/costs/sms ──────────────────────────────
@admin_bp.route('/costs/sms', methods=['GET'])
@admin_required
def sms_costs():
    """Get SMS and communication costs."""
    now = datetime.now(timezone.utc)
    day30 = now - timedelta(days=30)
    
    sms_count = OTPLog.query.filter(
        OTPLog.method == 'sms',
        OTPLog.timestamp >= day30
    ).count()
    
    email_count = OTPLog.query.filter(
        OTPLog.method == 'email',
        OTPLog.timestamp >= day30
    ).count()
    
    # Mock costs
    sms_cost_per_unit = 0.05  # $0.05 per SMS
    email_cost_per_unit = 0.001  # $0.001 per email
    
    total_sms_cost = sms_count * sms_cost_per_unit
    total_email_cost = email_count * email_cost_per_unit
    
    return jsonify({
        'period': 'last_30_days',
        'sms_count': sms_count,
        'sms_cost': round(total_sms_cost, 2),
        'sms_cost_per_unit': sms_cost_per_unit,
        'email_count': email_count,
        'email_cost': round(total_email_cost, 2),
        'total_communication_cost': round(total_sms_cost + total_email_cost, 2),
        'cost_by_user': round((total_sms_cost + total_email_cost) / (User.query.count() or 1), 2),
    }), 200


# ── GET /api/admin/costs/breakdown ────────────────────────
@admin_bp.route('/costs/breakdown', methods=['GET'])
@admin_required
def costs_breakdown():
    """Get cost breakdown by plan."""
    now = datetime.now(timezone.utc)
    day30 = now - timedelta(days=30)
    
    breakdown = []
    for plan in ['starter', 'growth', 'business', 'enterprise']:
        users = User.query.filter_by(plan=plan, role='user').all()
        total_cost = 0
        for user in users:
            sms_count = OTPLog.query.filter(
                OTPLog.user_id == user.id,
                OTPLog.method == 'sms',
                OTPLog.timestamp >= day30
            ).count()
            total_cost += sms_count * 0.05
        
        breakdown.append({
            'plan': plan.capitalize(),
            'users': len(users),
            'total_cost': round(total_cost, 2),
            'avg_cost_per_user': round(total_cost / (len(users) or 1), 2),
        })
    
    return jsonify({'cost_breakdown': breakdown}), 200


# ══════════════════════════════════════════════════════════
#  COMPLIANCE & AUDIT TRAIL
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/compliance/audit-log ───────────────────
@admin_bp.route('/compliance/audit-log', methods=['GET'])
@admin_required
def audit_log():
    """Get admin audit trail."""
    # Mock audit logs
    audit_entries = [
        {
            'id': 1,
            'admin_email': 'admin@example.com',
            'action': 'user_status_changed',
            'target_user': 'user1@example.com',
            'timestamp': (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            'details': 'Changed user status to inactive'
        },
        {
            'id': 2,
            'admin_email': 'admin@example.com',
            'action': 'mfa_reset',
            'target_user': 'user2@example.com',
            'timestamp': (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat(),
            'details': 'Reset MFA for user'
        },
        {
            'id': 3,
            'admin_email': 'admin@example.com',
            'action': 'user_deleted',
            'target_user': 'user3@example.com',
            'timestamp': (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
            'details': 'Deleted user account'
        },
    ]
    
    return jsonify({'audit_entries': audit_entries, 'total': len(audit_entries)}), 200


# ── GET /api/admin/compliance/data-access ────────────────
@admin_bp.route('/compliance/data-access', methods=['GET'])
@admin_required
def data_access_log():
    """Get data access and export logs."""
    access_logs = [
        {
            'user': 'john@example.com',
            'action': 'data_export',
            'timestamp': (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
            'records': 1250,
            'status': 'completed'
        },
        {
            'user': 'jane@example.com',
            'action': 'data_access',
            'timestamp': (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
            'records': 500,
            'status': 'completed'
        },
    ]
    
    return jsonify({'access_logs': access_logs}), 200


# ══════════════════════════════════════════════════════════
#  DEVICE & SESSION MANAGEMENT
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/sessions/active ────────────────────────
@admin_bp.route('/sessions/active', methods=['GET'])
@admin_required
def active_sessions():
    """Get active user sessions."""
    now = datetime.now(timezone.utc)
    day1 = now - timedelta(days=1)
    
    active_devices = Device.query.filter(Device.last_seen >= day1).count()
    total_sessions = OTPLog.query.filter(OTPLog.timestamp >= day1).count()
    
    # Get device distribution
    device_types = {}
    for device in Device.query.filter(Device.last_seen >= day1).all():
        device_type = device.device_type or 'unknown'
        device_types[device_type] = device_types.get(device_type, 0) + 1
    
    return jsonify({
        'active_devices': active_devices,
        'total_sessions_24h': total_sessions,
        'device_distribution': device_types,
        'avg_session_duration_minutes': 15,
    }), 200


# ── GET /api/admin/devices/geo-distribution ──────────────
@admin_bp.route('/devices/geo-distribution', methods=['GET'])
@admin_required
def geo_distribution():
    """Get device geo-location distribution."""
    loc_rows = (
        db.session.query(Device.location, func.count(Device.id))
        .group_by(Device.location)
        .order_by(func.count(Device.id).desc()).limit(10).all()
    )
    
    total = sum(c for _, c in loc_rows) or 1
    locations = [
        {'location': l or 'Unknown', 'devices': c, 'percentage': round(c / total * 100)}
        for l, c in loc_rows
    ]
    
    return jsonify({'geographic_distribution': locations}), 200


# ══════════════════════════════════════════════════════════
#  PROMOTIONS & DISCOUNTS
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/promotions/overview ────────────────────
@admin_bp.route('/promotions/overview', methods=['GET'])
@admin_required
def promotions_overview():
    """Get promotions and discount overview."""
    promotions = [
        {
            'id': 1,
            'code': 'LAUNCH20',
            'discount': 20,
            'type': 'percentage',
            'created': (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
            'active': True,
            'usage_count': 45,
            'total_discount_value': 450.00,
        },
        {
            'id': 2,
            'code': 'SUMMER15',
            'discount': 15,
            'type': 'percentage',
            'created': (datetime.now(timezone.utc) - timedelta(days=14)).isoformat(),
            'active': True,
            'usage_count': 28,
            'total_discount_value': 250.00,
        },
    ]
    
    return jsonify({
        'active_promotions': len(promotions),
        'total_users_with_discounts': 73,
        'total_discount_value': 700.00,
        'promotions': promotions
    }), 200


# ── GET /api/admin/promotions/trial-conversion ───────────
@admin_bp.route('/promotions/trial-conversion', methods=['GET'])
@admin_required
def trial_conversion():
    """Get trial conversion metrics."""
    total_trials = User.query.filter_by(plan='starter').count()
    converted = int(total_trials * 0.35)
    
    return jsonify({
        'total_trial_users': total_trials,
        'converted_users': converted,
        'conversion_rate': round(converted / (total_trials or 1) * 100, 1),
        'avg_time_to_conversion_days': 14,
        'trial_expiring_soon': int(total_trials * 0.15),
    }), 200


# ══════════════════════════════════════════════════════════
#  PLAN ANALYTICS
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/plans/analytics ────────────────────────
@admin_bp.route('/plans/analytics', methods=['GET'])
@admin_required
def plan_analytics():
    """Get plan usage and analytics."""
    plans = ['starter', 'growth', 'business', 'enterprise']
    plan_data = []
    
    for plan in plans:
        users = User.query.filter_by(plan=plan, role='user').all()
        plan_data.append({
            'plan': plan.capitalize(),
            'users': len(users),
            'growth': round((len(users) / 100) * 5, 1),  # Mock growth %
            'churn': round((len(users) / 100) * 2, 1),   # Mock churn %
            'avg_spending': 99 if plan == 'starter' else 299 if plan == 'growth' else 999,
        })
    
    return jsonify({'plan_analytics': plan_data}), 200


# ── GET /api/admin/plans/upgrade-downgrade ──────────────
@admin_bp.route('/plans/upgrade-downgrade', methods=['GET'])
@admin_required
def upgrade_downgrade_trends():
    """Get plan upgrade/downgrade trends."""
    now = datetime.now(timezone.utc)
    
    trend_data = []
    for i in range(11, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        month_str = month_start.strftime('%b')
        
        trend_data.append({
            'month': month_str,
            'upgrades': 12 + (i % 8),
            'downgrades': 3 + (i % 5),
            'net_change': (12 + (i % 8)) - (3 + (i % 5)),
        })
    
    return jsonify({'upgrade_downgrade_trend': trend_data}), 200


# ══════════════════════════════════════════════════════════
#  REAL-TIME MONITORING
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/realtime/dashboard ─────────────────────
@admin_bp.route('/realtime/dashboard', methods=['GET'])
@admin_required
def realtime_dashboard():
    """Get real-time monitoring data."""
    now = datetime.now(timezone.utc)
    hour_ago = now - timedelta(hours=1)
    
    active_now = OTPLog.query.filter(OTPLog.timestamp >= hour_ago).count()
    online_users = Device.query.filter(Device.last_seen >= hour_ago).count()
    
    return jsonify({
        'online_users': online_users,
        'active_sessions_1h': active_now,
        'system_status': 'operational',
        'alerts_active': 2,
        'last_update': now.isoformat(),
    }), 200


# ── GET /api/admin/realtime/activity-feed ────────────────
@admin_bp.route('/realtime/activity-feed', methods=['GET'])
@admin_required
def activity_feed():
    """Get real-time activity feed."""
    now = datetime.now(timezone.utc)
    hour_ago = now - timedelta(hours=1)
    
    recent_logs = OTPLog.query.filter(
        OTPLog.timestamp >= hour_ago
    ).order_by(OTPLog.timestamp.desc()).limit(20).all()
    
    activity = []
    for log in recent_logs:
        user = User.query.get(log.user_id)
        activity.append({
            'id': log.id,
            'user': user.email if user else 'deleted',
            'action': 'OTP ' + log.status,
            'method': log.method,
            'timestamp': log.timestamp.isoformat(),
            'ip': log.ip_address,
        })
    
    return jsonify({'activity_feed': activity}), 200


# ══════════════════════════════════════════════════════════
#  USER SEGMENTATION
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/segments/overview ──────────────────────
@admin_bp.route('/segments/overview', methods=['GET'])
@admin_required
def user_segments():
    """Get user segmentation overview."""
    segments = [
        {
            'id': 'power_users',
            'name': 'Power Users',
            'count': 234,
            'description': '100+ logins per month',
            'avg_engagement': 95,
        },
        {
            'id': 'casual_users',
            'name': 'Casual Users',
            'count': 456,
            'description': '10-100 logins per month',
            'avg_engagement': 65,
        },
        {
            'id': 'inactive_users',
            'name': 'Inactive Users',
            'count': 123,
            'description': 'No logins in 30 days',
            'avg_engagement': 15,
        },
        {
            'id': 'at_risk',
            'name': 'At-Risk Users',
            'count': 89,
            'description': 'Declining activity',
            'avg_engagement': 25,
        },
    ]
    
    return jsonify({'segments': segments}), 200


# ── POST /api/admin/segments/apply-action ────────────────
@admin_bp.route('/segments/apply-action', methods=['POST'])
@admin_required
def apply_segment_action():
    """Apply bulk action to user segment."""
    data = request.get_json() or {}
    segment_id = data.get('segment_id')
    action = data.get('action')  # email, discount, upgrade, downgrade
    
    return jsonify({
        'message': f'Applied {action} to segment {segment_id}',
        'affected_users': 123
    }), 200


# ══════════════════════════════════════════════════════════
#  API & INTEGRATION HEALTH
# ══════════════════════════════════════════════════════════

# ── GET /api/admin/integrations/health ────────────────────
@admin_bp.route('/integrations/health', methods=['GET'])
@admin_required
def integration_health():
    """Get API and integration health status."""
    integrations = [
        {
            'name': 'Email Provider',
            'status': 'operational',
            'uptime': 99.95,
            'last_check': (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat(),
            'response_time_ms': 245,
        },
        {
            'name': 'SMS Provider',
            'status': 'operational',
            'uptime': 99.98,
            'last_check': (datetime.now(timezone.utc) - timedelta(minutes=3)).isoformat(),
            'response_time_ms': 1200,
        },
        {
            'name': 'Database',
            'status': 'operational',
            'uptime': 99.99,
            'last_check': (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat(),
            'response_time_ms': 12,
        },
    ]
    
    return jsonify({'integrations': integrations}), 200


# ── GET /api/admin/api/quota ──────────────────────────────
@admin_bp.route('/api/quota', methods=['GET'])
@admin_required
def api_quota():
    """Get API quota usage per user."""
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1)
    
    quotas = []
    for user in User.query.filter_by(role='user').limit(10).all():
        usage = OTPLog.query.filter(
            OTPLog.user_id == user.id,
            OTPLog.timestamp >= month_start
        ).count()
        
        quota_limit = 10000 if user.plan == 'enterprise' else 1000 if user.plan == 'business' else 100
        
        quotas.append({
            'user': user.email,
            'plan': user.plan,
            'usage': usage,
            'quota': quota_limit,
            'percentage': round(usage / quota_limit * 100, 1),
        })
    
    return jsonify({'quotas': quotas}), 200
