from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app.extensions import db
from app.models import Plan, Subscription, User
from app.subscription.service import SubscriptionService
from app.subscription.middleware import require_subscription, subscription_context

subscription_bp = Blueprint('subscription', __name__)


# ══════════════════════════════════════════════════════════
#  PUBLIC ENDPOINTS - No authentication required
# ══════════════════════════════════════════════════════════

@subscription_bp.route('/plans', methods=['GET'])
def get_plans():
    """Get all available subscription plans"""
    plans = Plan.query.filter_by(is_active=True).order_by(Plan.price_kes.asc()).all()
    return jsonify({
        'plans': [plan.to_dict() for plan in plans]
    }), 200


# ══════════════════════════════════════════════════════════
#  USER SUBSCRIPTION MANAGEMENT
# ══════════════════════════════════════════════════════════

@subscription_bp.route('/current', methods=['GET'])
@subscription_context
def get_current_subscription():
    """Get user's current subscription details"""
    if not g.current_subscription:
        return jsonify({
            'subscription': None,
            'plan': None,
            'message': 'No active subscription'
        }), 200
    
    return jsonify({
        'subscription': g.current_subscription.to_dict(),
        'plan': g.current_plan.to_dict() if g.current_plan else None,
        'is_trial': g.current_subscription.is_trial,
        'trial_ends': g.current_subscription.trial_ends.isoformat() if g.current_subscription.trial_ends else None
    }), 200


@subscription_bp.route('/subscribe', methods=['POST'])
@jwt_required()
def subscribe_to_plan():
    """Subscribe user to a plan"""
    data = request.get_json() or {}
    plan_name = data.get('plan_name', '').strip().lower()
    
    if not plan_name:
        return jsonify({'error': 'plan_name is required'}), 400
    
    user_id = int(get_jwt_identity())
    
    try:
        subscription = SubscriptionService.create_subscription(user_id, plan_name)
        from app.audit import log_subscription_created
        log_subscription_created(user_id=user_id, plan=plan_name, ip=request.remote_addr or '')
        return jsonify({
            'message': f'Successfully subscribed to {plan_name} plan',
            'subscription': subscription.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to create subscription'}), 500


@subscription_bp.route('/upgrade', methods=['POST'])
@require_subscription
def upgrade_subscription():
    """Upgrade user's subscription to a higher plan"""
    data = request.get_json() or {}
    new_plan_name = data.get('plan_name', '').strip().lower()
    
    if not new_plan_name:
        return jsonify({'error': 'plan_name is required'}), 400
    
    try:
        old_plan = g.current_plan.name if g.current_plan else 'unknown'
        subscription = SubscriptionService.upgrade_subscription(g.current_user.id, new_plan_name)
        from app.audit import log_subscription_upgraded
        log_subscription_upgraded(user_id=g.current_user.id, old_plan=old_plan, new_plan=new_plan_name, ip=request.remote_addr or '')
        return jsonify({
            'message': f'Successfully upgraded to {new_plan_name} plan',
            'subscription': subscription.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to upgrade subscription'}), 500


@subscription_bp.route('/trial', methods=['POST'])
@jwt_required()
def start_trial():
    """Start a trial subscription"""
    data = request.get_json() or {}
    plan_name = data.get('plan_name', 'growth').strip().lower()
    trial_days = data.get('trial_days', 14)
    
    user_id = int(get_jwt_identity())
    
    # Check if user already had a trial
    existing_trial = Subscription.query.filter_by(
        user_id=user_id,
        status='trial'
    ).first()
    
    if existing_trial:
        return jsonify({'error': 'Trial already used'}), 400
    
    try:
        subscription = SubscriptionService.start_trial(user_id, plan_name, trial_days)
        return jsonify({
            'message': f'Trial started for {plan_name} plan ({trial_days} days)',
            'subscription': subscription.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to start trial'}), 500


@subscription_bp.route('/cancel', methods=['POST'])
@require_subscription
def cancel_subscription():
    """Cancel user's current subscription"""
    subscription = g.current_subscription
    subscription.status = 'cancelled'
    subscription.end_date = datetime.now(timezone.utc)
    subscription.auto_renew = False
    db.session.commit()
    from app.audit import log_subscription_cancelled
    plan_name = subscription.plan.name if subscription.plan else 'unknown'
    log_subscription_cancelled(user_id=g.current_user.id, plan=plan_name, ip=request.remote_addr or '')
    return jsonify({
        'message': 'Subscription cancelled successfully',
        'subscription': subscription.to_dict()
    }), 200


# ══════════════════════════════════════════════════════════
#  USAGE TRACKING & ANALYTICS
# ══════════════════════════════════════════════════════════

@subscription_bp.route('/usage', methods=['GET'])
@require_subscription
def get_usage_stats():
    """Get usage statistics for current user"""
    month = request.args.get('month')  # Format: YYYY-MM
    
    stats = SubscriptionService.get_usage_stats(g.current_user.id, month)
    
    # Add plan limits for context
    plan = g.current_plan
    stats['plan_limits'] = {
        'max_users': plan.max_users,
        'sms_enabled': plan.sms_enabled,
        'otp_channels': plan.otp_channels,
        'features': plan.features
    }
    
    # Add current usage vs limits
    current_users = g.current_user.get_user_count()
    stats['current_usage'] = {
        'users': current_users,
        'users_percentage': (current_users / plan.max_users * 100) if plan.max_users > 0 else 0
    }
    
    return jsonify(stats), 200


@subscription_bp.route('/usage/history', methods=['GET'])
@require_subscription
def get_usage_history():
    """Get usage history for multiple months"""
    from app.models import UsageSummary
    
    months = request.args.get('months', 6, type=int)  # Default 6 months
    
    summaries = UsageSummary.query.filter_by(
        user_id=g.current_user.id
    ).order_by(UsageSummary.month.desc()).limit(months).all()
    
    return jsonify({
        'usage_history': [summary.to_dict() for summary in summaries]
    }), 200


# ══════════════════════════════════════════════════════════
#  PLAN VALIDATION ENDPOINTS
# ══════════════════════════════════════════════════════════

@subscription_bp.route('/check/feature/<feature_name>', methods=['GET'])
@subscription_context
def check_feature(feature_name):
    """Check if user has access to a specific feature"""
    if not g.current_user:
        return jsonify({'has_access': False, 'reason': 'Not authenticated'}), 401
    
    allowed, message = SubscriptionService.check_feature_access(
        g.current_user.id, feature_name
    )
    
    return jsonify({
        'has_access': allowed,
        'message': message,
        'feature': feature_name
    }), 200


@subscription_bp.route('/check/channel/<channel_type>', methods=['GET'])
@subscription_context
def check_channel(channel_type):
    """Check if user can use a specific OTP channel"""
    if not g.current_user:
        return jsonify({'has_access': False, 'reason': 'Not authenticated'}), 401
    
    allowed, message = SubscriptionService.check_otp_channel(
        g.current_user.id, channel_type
    )
    
    return jsonify({
        'has_access': allowed,
        'message': message,
        'channel': channel_type
    }), 200


@subscription_bp.route('/check/limits', methods=['GET'])
@subscription_context
def check_limits():
    """Check user's current limits and usage"""
    if not g.current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user_allowed, user_message = SubscriptionService.check_user_limit(g.current_user.id)
    
    return jsonify({
        'user_limit': {
            'within_limit': user_allowed,
            'message': user_message
        },
        'plan_details': g.current_plan.to_dict() if g.current_plan else None
    }), 200


# ══════════════════════════════════════════════════════════
#  ADMIN ENDPOINTS
# ══════════════════════════════════════════════════════════

@subscription_bp.route('/admin/plans', methods=['POST'])
@jwt_required()
def create_plan():
    """Create a new subscription plan (Admin only)"""
    user = User.query.get(int(get_jwt_identity()))
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json() or {}
    
    required_fields = ['name', 'display_name', 'price_kes', 'max_users']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        plan = Plan(
            name=data['name'].strip().lower(),
            display_name=data['display_name'],
            price_kes=data['price_kes'],
            price_usd=data.get('price_usd', 0),
            max_users=data['max_users'],
            otp_channels=data.get('otp_channels', ['email']),
            features=data.get('features', ['basic_dashboard']),
            sms_enabled=data.get('sms_enabled', False),
            sms_cost_min=data.get('sms_cost_min', 0),
            sms_cost_max=data.get('sms_cost_max', 0)
        )
        
        db.session.add(plan)
        db.session.commit()
        
        return jsonify({
            'message': 'Plan created successfully',
            'plan': plan.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'error': 'Failed to create plan'}), 500


@subscription_bp.route('/admin/users/<int:user_id>/subscription', methods=['POST'])
@jwt_required()
def admin_manage_subscription(user_id):
    """Manage user subscription (Admin only)"""
    admin = User.query.get(int(get_jwt_identity()))
    if not admin or admin.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json() or {}
    action = data.get('action')  # create, upgrade, cancel
    plan_name = data.get('plan_name')
    
    if action == 'create' and plan_name:
        try:
            subscription = SubscriptionService.create_subscription(user_id, plan_name)
            return jsonify({
                'message': f'Subscription created for user {user_id}',
                'subscription': subscription.to_dict()
            }), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
    
    elif action == 'upgrade' and plan_name:
        try:
            subscription = SubscriptionService.upgrade_subscription(user_id, plan_name)
            return jsonify({
                'message': f'Subscription upgraded for user {user_id}',
                'subscription': subscription.to_dict()
            }), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
    
    elif action == 'cancel':
        subscription = SubscriptionService.get_user_subscription(user_id)
        if subscription:
            subscription.status = 'cancelled'
            subscription.end_date = datetime.now(timezone.utc)
            db.session.commit()
            return jsonify({'message': 'Subscription cancelled'}), 200
        else:
            return jsonify({'error': 'No active subscription found'}), 404
    
    return jsonify({'error': 'Invalid action or missing parameters'}), 400