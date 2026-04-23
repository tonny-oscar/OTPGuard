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
    """Analyze user churn patterns and at-risk users."""
    now = datetime.now(timezone.utc)
    day30 = now - timedelta(days=30)
    day60 = now - timedelta(days=60)
    day90 = now - timedelta(days=90)
    day180 = now - timedelta(days=180)
    
    # Inactive users (no login in last 30 days)
    inactive_30d = []
    for user in User.query.filter_by(role='user', is_active=True).all():
        last_login = db.session.query(func.max(OTPLog.timestamp)).filter(
            OTPLog.user_id == user.id,
            OTPLog.status == 'verified'
        ).scalar()
        
        if not last_login or last_login < day30:
            days_inactive = (now - (last_login or user.created_at)).days
            inactive_30d.append({
                'user_id': user.id,
                'email': user.email,
                'name': user.full_name,
                'plan': user.plan,
                'last_login': last_login.isoformat() if last_login else None,
                'days_inactive': days_inactive,
                'joined': user.created_at.isoformat()
            })
    
    # High-risk users (decreasing activity)
    high_risk = []
    for user in User.query.filter_by(role='user', is_active=True).all():
        logins_30d = OTPLog.query.filter(
            OTPLog.user_id == user.id,
            OTPLog.timestamp >= day30,
            OTPLog.status == 'verified'
        ).count()
        
        logins_60_90d = OTPLog.query.filter(
            OTPLog.user_id == user.id,
            OTPLog.timestamp >= day90,
            OTPLog.timestamp < day60,
            OTPLog.status == 'verified'
        ).count()
        
        if logins_60_90d > 0 and logins_30d < logins_60_90d * 0.5:
            high_risk.append({
                'user_id': user.id,
                'email': user.email,
                'plan': user.plan,
                'activity_decline': round((1 - logins_30d / logins_60_90d) * 100),
                'logins_30d': logins_30d,
                'logins_prev_30d': logins_60_90d
            })
    
    # Churn rate
    churned_last_30d = User.query.filter(
        User.is_active == False,
        User.updated_at >= day30
    ).count()
    
    total_users = User.query.filter_by(role='user').count()
    churn_rate = round(churned_last_30d / total_users * 100) if total_users > 0 else 0
    
    # Churn trend
    churn_trend = []
    for i in range(4):
        start = now - timedelta(days=(i + 1) * 30)
        end = now - timedelta(days=i * 30)
        
        churned = User.query.filter(
            User.is_active == False,
            User.updated_at >= start,
            User.updated_at < end
        ).count()
        
        churn_trend.append({
            'period': f'{start.strftime("%b")}-{end.strftime("%b")}',
            'churned_users': churned
        })
    
    return jsonify({
        'churn_rate_30d': churn_rate,
        'at_risk_users': len(high_risk),
        'inactive_users_30d': len(inactive_30d),
        'churned_last_30d': churned_last_30d,
        'inactive_users': inactive_30d[:20],
        'high_risk_users': high_risk[:20],
        'churn_trend': churn_trend
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
    
    else:
        report = {'error': 'Invalid report type'}, 400
    
    return jsonify(report), 200


# ── GET /api/admin/reports/list ───────────────────────────
@admin_bp.route('/reports/list', methods=['GET'])
@admin_required
def list_custom_reports():
    """List available report templates."""
    reports = [
        {
            'id': 'usage-report',
            'name': 'Usage Report',
            'description': 'Detailed usage and billing report',
            'filters': ['days', 'user_id', 'method']
        },
        {
            'id': 'revenue-report',
            'name': 'Revenue Report',
            'description': 'Revenue analytics and subscription breakdown',
            'filters': ['period', 'plan']
        },
        {
            'id': 'security-report',
            'name': 'Security Report',
            'description': 'Security events and suspicious activity',
            'filters': ['days', 'ip_address', 'status']
        },
        {
            'id': 'churn-report',
            'name': 'Churn Analysis',
            'description': 'User churn and retention analysis',
            'filters': ['days', 'plan']
        },
        {
            'id': 'lifecycle-report',
            'name': 'Lifecycle Report',
            'description': 'User lifecycle and cohort analysis',
            'filters': ['cohort_period']
        }
    ]
    
    return jsonify({'reports': reports}), 200
