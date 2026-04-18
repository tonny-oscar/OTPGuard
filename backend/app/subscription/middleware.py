from functools import wraps
from flask import request, jsonify, g
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import User
from app.subscription.service import SubscriptionService


def require_subscription(f):
    """Decorator to ensure user has an active subscription"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        subscription = user.current_subscription
        if not subscription or not subscription.is_active:
            return jsonify({
                'error': 'Active subscription required',
                'code': 'SUBSCRIPTION_REQUIRED'
            }), 402  # Payment Required
        
        g.current_user = user
        g.current_subscription = subscription
        g.current_plan = subscription.plan
        
        return f(*args, **kwargs)
    return decorated_function


def require_feature(feature_name):
    """Decorator to check if user's plan includes a specific feature"""
    def decorator(f):
        @wraps(f)
        @require_subscription
        def decorated_function(*args, **kwargs):
            allowed, message = SubscriptionService.check_feature_access(
                g.current_user.id, feature_name
            )
            
            if not allowed:
                return jsonify({
                    'error': message,
                    'code': 'FEATURE_NOT_AVAILABLE',
                    'required_feature': feature_name
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def require_channel(channel_type):
    """Decorator to check if user's plan allows specific OTP channel"""
    def decorator(f):
        @wraps(f)
        @require_subscription
        def decorated_function(*args, **kwargs):
            allowed, message = SubscriptionService.check_otp_channel(
                g.current_user.id, channel_type
            )
            
            if not allowed:
                return jsonify({
                    'error': message,
                    'code': 'CHANNEL_NOT_AVAILABLE',
                    'required_channel': channel_type
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def check_user_limit(f):
    """Decorator to check if user has reached their user limit"""
    @wraps(f)
    @require_subscription
    def decorated_function(*args, **kwargs):
        allowed, message = SubscriptionService.check_user_limit(g.current_user.id)
        
        if not allowed:
            return jsonify({
                'error': message,
                'code': 'USER_LIMIT_REACHED'
            }), 403
        
        return f(*args, **kwargs)
    return decorated_function


def rate_limit_otp(max_requests=5, window_minutes=5):
    """Rate limiting decorator for OTP requests"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            from datetime import datetime, timezone, timedelta
            from app.models import OTPLog
            
            # Get user ID from JWT or API key
            user_id = None
            if hasattr(request, 'api_key'):
                # For API key requests, use the API key owner
                user_id = request.api_key.user_id
            else:
                try:
                    user_id = int(get_jwt_identity())
                except:
                    pass
            
            if not user_id:
                return jsonify({'error': 'Authentication required'}), 401
            
            # Check rate limit
            window_start = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)
            recent_requests = OTPLog.query.filter(
                OTPLog.user_id == user_id,
                OTPLog.timestamp >= window_start,
                OTPLog.status.in_(['pending', 'verified'])
            ).count()
            
            if recent_requests >= max_requests:
                return jsonify({
                    'error': f'Rate limit exceeded. Max {max_requests} OTP requests per {window_minutes} minutes',
                    'code': 'RATE_LIMIT_EXCEEDED',
                    'retry_after': window_minutes * 60
                }), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def log_api_usage(usage_type, cost_calculator=None):
    """Decorator to log API usage for billing"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Execute the function first
            result = f(*args, **kwargs)
            
            # Only log if request was successful
            if isinstance(result, tuple) and len(result) == 2:
                response, status_code = result
                if status_code < 400:  # Success status codes
                    _log_usage_after_success(usage_type, cost_calculator)
            elif hasattr(result, 'status_code') and result.status_code < 400:
                _log_usage_after_success(usage_type, cost_calculator)
            
            return result
        return decorated_function
    return decorator


def _log_usage_after_success(usage_type, cost_calculator=None):
    """Helper to log usage after successful API call"""
    user_id = None
    
    # Get user ID from JWT or API key
    if hasattr(request, 'api_key'):
        user_id = request.api_key.user_id
    else:
        try:
            user_id = int(get_jwt_identity())
        except:
            pass
    
    if not user_id:
        return
    
    # Calculate cost if calculator provided
    cost = 0
    if cost_calculator:
        cost = cost_calculator(user_id)
    elif usage_type == 'sms_otp':
        cost = SubscriptionService.calculate_sms_cost(user_id)
    
    # Get metadata from request
    extra_data = {
        'ip_address': request.remote_addr,
        'user_agent': request.user_agent.string,
        'endpoint': request.endpoint
    }
    
    # Add channel-specific metadata
    if usage_type in ['email_otp', 'sms_otp']:
        data = request.get_json() or {}
        if 'email' in data:
            extra_data['email'] = data['email']
        if 'phone' in data:
            extra_data['phone'] = data['phone']
    
    # Log the usage
    SubscriptionService.log_usage(
        user_id=user_id,
        usage_type=usage_type,
        quantity=1,
        cost_kes=cost,
        extra_data=extra_data
    )


def subscription_context(f):
    """Decorator to add subscription context to request"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user:
            g.current_user = user
            g.current_subscription = user.current_subscription
            g.current_plan = user.current_plan
        
        return f(*args, **kwargs)
    return decorated_function