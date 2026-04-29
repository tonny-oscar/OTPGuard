from flask import Blueprint, jsonify, g
from app.subscription.middleware import subscription_context, require_feature, require_channel
from app.subscription.service import SubscriptionService

feature_bp = Blueprint('features', __name__)

@feature_bp.route('/check', methods=['GET'])
@subscription_context
def check_all_features():
    """Get all feature access for current user"""
    if not g.current_user or not g.current_plan:
        return jsonify({'error': 'No active subscription'}), 402
    
    plan = g.current_plan
    
    return jsonify({
        'plan': {
            'name': plan.name,
            'display_name': plan.display_name,
            'max_users': plan.max_users,
            'otp_channels': plan.otp_channels,
            'features': plan.features,
            'sms_enabled': plan.sms_enabled
        },
        'access': {
            'basic_dashboard': True,
            'full_dashboard': 'full_dashboard' in plan.features,
            'admin_dashboard': 'admin_dashboard' in plan.features,
            'email_otp': 'email' in plan.otp_channels,
            'sms_otp': 'sms' in plan.otp_channels,
            'totp': 'totp' in plan.otp_channels,
            'device_tracking': 'device_tracking' in plan.features,
            'custom_branding': 'custom_branding' in plan.features,
            'white_label': 'white_label' in plan.features,
            'audit_logs': 'audit_logs' in plan.features,
            'custom_integrations': 'custom_integrations' in plan.features,
            'analytics': 'login_analytics' in plan.features or 'full_dashboard' in plan.features
        }
    }), 200


@feature_bp.route('/matrix', methods=['GET'])
def get_feature_matrix():
    """Get complete feature matrix for all plans"""
    from app.models import Plan
    
    plans = Plan.query.filter_by(is_active=True).order_by(Plan.price_kes.asc()).all()
    
    matrix = {}
    for plan in plans:
        matrix[plan.name] = {
            'display_name': plan.display_name,
            'price_kes': plan.price_kes / 100,
            'price_usd': plan.price_usd / 100,
            'max_users': plan.max_users,
            'otp_channels': plan.otp_channels,
            'features': plan.features,
            'sms_enabled': plan.sms_enabled,
            'sms_cost_range': f"{plan.sms_cost_min/100:.2f}-{plan.sms_cost_max/100:.2f} KES" if plan.sms_enabled else None
        }
    
    return jsonify({'matrix': matrix}), 200
