import random
import string
import pyotp
from datetime import datetime, timezone, timedelta
from functools import wraps

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    jwt_required, get_jwt_identity, get_jwt,
    create_access_token, create_refresh_token
)

from app.extensions import db
from app.models import User, OTPLog, APIKey
from app.notifications.service import send_email_otp, send_sms_otp
from app.subscription.middleware import (
    require_channel, rate_limit_otp, log_api_usage, check_user_limit
)
from app.subscription.service import SubscriptionService

mfa_bp = Blueprint('mfa', __name__)


# ── API Key auth decorator ────────────────────────────────
def api_key_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        raw = request.headers.get('X-API-Key', '')
        if not raw:
            return jsonify({'error': 'Missing X-API-Key header'}), 401
        key = APIKey.query.filter_by(key=raw, is_active=True).first()
        if not key:
            return jsonify({'error': 'Invalid or revoked API key'}), 401
        # Update last_used
        key.last_used = datetime.now(timezone.utc)
        db.session.commit()
        request.api_key = key
        return fn(*args, **kwargs)
    return wrapper


# ══════════════════════════════════════════════════════════
#  EXTERNAL API  — called by businesses from their backends
# ══════════════════════════════════════════════════════════

# ── POST /api/mfa/otp/send  (X-API-Key auth) ─────────────
# Business calls this after their user logs in
@mfa_bp.route('/otp/send', methods=['POST'])
@api_key_required
@rate_limit_otp(max_requests=10, window_minutes=5)
@log_api_usage('email_otp')  # Will be updated based on method
def external_send_otp():
    data   = request.get_json() or {}
    phone  = data.get('phone', '').strip()
    email  = data.get('email', '').strip().lower()
    method = data.get('method', 'sms').strip()   # sms | email

    if method not in ('sms', 'email'):
        return jsonify({'error': 'method must be sms or email'}), 400
    if method == 'sms' and not phone:
        return jsonify({'error': 'phone is required for SMS'}), 400
    if method == 'email' and not email:
        return jsonify({'error': 'email is required for email OTP'}), 400

    # Check if API key owner's plan allows this channel
    api_key_owner = User.query.get(request.api_key.user_id)
    if not api_key_owner.can_use_channel(method):
        return jsonify({
            'error': f'Your plan does not support {method} OTP',
            'code': 'CHANNEL_NOT_AVAILABLE'
        }), 403

    # Check user limits for API key owner
    allowed, message = SubscriptionService.check_user_limit(request.api_key.user_id)
    if not allowed:
        return jsonify({
            'error': message,
            'code': 'USER_LIMIT_REACHED'
        }), 403

    # Find or create a shadow user record keyed by phone/email
    identifier = phone if method == 'sms' else email
    user = User.query.filter_by(email=identifier).first()
    if not user:
        user = User(
            email=identifier,
            password_hash='__external__',
            full_name='External User',
            phone=phone,
            role='user', plan='starter', mfa_enabled=True
        )
        db.session.add(user)
        db.session.commit()
        
        # Log user creation for billing
        SubscriptionService.log_usage(
            user_id=request.api_key.user_id,
            usage_type='user_added',
            quantity=1,
            extra_data={'external_user_id': user.id, 'identifier': identifier}
        )

    code   = _generate_code(current_app.config['OTP_LENGTH'])
    expiry = datetime.now(timezone.utc) + timedelta(seconds=current_app.config['OTP_EXPIRY_SECONDS'])

    OTPLog.query.filter_by(user_id=user.id, status='pending').update({'status': 'expired'})
    db.session.commit()

    log = OTPLog(
        user_id=user.id, api_key_id=request.api_key.id,
        code=code, method=method, status='pending',
        ip_address=request.remote_addr, expires_at=expiry
    )
    db.session.add(log)
    db.session.commit()

    # Calculate and log SMS cost if applicable
    cost = 0
    if method == 'sms':
        cost = SubscriptionService.calculate_sms_cost(request.api_key.user_id)
        SubscriptionService.log_usage(
            user_id=request.api_key.user_id,
            usage_type='sms_otp',
            quantity=1,
            cost_kes=cost,
            extra_data={'phone': phone, 'external_user_id': user.id}
        )
    else:
        SubscriptionService.log_usage(
            user_id=request.api_key.user_id,
            usage_type='email_otp',
            quantity=1,
            extra_data={'email': email, 'external_user_id': user.id}
        )

    if method == 'email':
        send_email_otp(email, code)
    else:
        send_sms_otp(phone, code)

    return jsonify({
        'message':    f'OTP sent via {method}',
        'expires_in': current_app.config['OTP_EXPIRY_SECONDS'],
        'otp_id':     log.id,
        'cost_kes':   cost if method == 'sms' else 0
    }), 200


# ── POST /api/mfa/otp/verify  (X-API-Key auth) ───────────
# Business calls this when their user submits the code
@mfa_bp.route('/otp/verify', methods=['POST'])
@api_key_required
def external_verify_otp():
    data   = request.get_json() or {}
    phone  = data.get('phone', '').strip()
    email  = data.get('email', '').strip().lower()
    code   = data.get('code', '').strip()
    method = data.get('method', 'sms').strip()

    if not code:
        return jsonify({'error': 'code is required'}), 400

    identifier = phone if method == 'sms' else email
    user = User.query.filter_by(email=identifier).first()
    if not user:
        return jsonify({'error': 'No OTP found for this identifier'}), 404

    ok = _verify_code(user.id, code)
    if not ok:
        return jsonify({'verified': False, 'error': 'Invalid or expired OTP'}), 401

    return jsonify({'verified': True, 'message': 'OTP verified successfully'}), 200


# ══════════════════════════════════════════════════════════
#  INTERNAL  — called by OTPGuard's own frontend (JWT auth)
# ══════════════════════════════════════════════════════════

# ── POST /api/mfa/send ────────────────────────────────────
@mfa_bp.route('/send', methods=['POST'])
@jwt_required()
@rate_limit_otp(max_requests=5, window_minutes=5)
def send_otp():
    claims = get_jwt()
    if not claims.get('mfa_pending'):
        return jsonify({'error': 'Not a pre-auth token'}), 403

    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.mfa_method == 'totp':
        return jsonify({'error': 'Use your authenticator app'}), 400

    # Check if user's plan allows the MFA method
    if not user.can_use_channel(user.mfa_method):
        return jsonify({
            'error': f'Your plan does not support {user.mfa_method} MFA',
            'code': 'CHANNEL_NOT_AVAILABLE'
        }), 403

    code   = _generate_code(current_app.config['OTP_LENGTH'])
    expiry = datetime.now(timezone.utc) + timedelta(seconds=current_app.config['OTP_EXPIRY_SECONDS'])

    OTPLog.query.filter_by(user_id=user.id, status='pending').update({'status': 'expired'})
    db.session.commit()

    log = OTPLog(user_id=user.id, code=code, method=user.mfa_method,
                 status='pending', ip_address=request.remote_addr, expires_at=expiry)
    db.session.add(log)
    db.session.commit()

    # Log usage and calculate cost
    cost = 0
    if user.mfa_method == 'email':
        send_email_otp(user.email, code)
        dest = _mask_email(user.email)
        SubscriptionService.log_usage(
            user_id=user.id,
            usage_type='email_otp',
            quantity=1,
            extra_data={'email': user.email}
        )
    else:
        send_sms_otp(user.phone, code)
        dest = _mask_phone(user.phone)
        cost = SubscriptionService.calculate_sms_cost(user.id)
        SubscriptionService.log_usage(
            user_id=user.id,
            usage_type='sms_otp',
            quantity=1,
            cost_kes=cost,
            extra_data={'phone': user.phone}
        )

    return jsonify({
        'message': f'OTP sent to {dest}', 
        'method': user.mfa_method,
        'expires_in': current_app.config['OTP_EXPIRY_SECONDS'],
        'cost_kes': cost if user.mfa_method == 'sms' else 0
    }), 200


# ── POST /api/mfa/verify ──────────────────────────────────
@mfa_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_otp():
    claims = get_jwt()
    if not claims.get('mfa_pending'):
        return jsonify({'error': 'Not a pre-auth token'}), 403

    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    code = (request.get_json() or {}).get('code', '').strip()
    if not code:
        return jsonify({'error': 'OTP code is required'}), 400

    if user.mfa_method == 'totp':
        ok = _verify_totp(user.mfa_secret, code)
        _log_attempt(user.id, code, 'totp', 'verified' if ok else 'failed', request.remote_addr)
    else:
        ok = _verify_code(user.id, code)

    if not ok:
        return jsonify({'error': 'Invalid or expired OTP'}), 401

    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({'message': 'MFA verified', 'user': user.to_dict(),
                    'access_token': access_token, 'refresh_token': refresh_token}), 200


# ── POST /api/mfa/totp/setup ──────────────────────────────
@mfa_bp.route('/totp/setup', methods=['POST'])
@jwt_required()
def totp_setup():
    user = User.query.get(int(get_jwt_identity()))
    
    # Check if user's plan supports TOTP
    if not user.can_use_channel('totp'):
        return jsonify({
            'error': 'Your plan does not support TOTP authentication',
            'code': 'CHANNEL_NOT_AVAILABLE'
        }), 403
    
    secret = pyotp.random_base32()
    uri    = pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name='OTPGuard')
    user.mfa_secret = secret
    db.session.commit()
    return jsonify({'secret': secret, 'provisioning_uri': uri}), 200


# ── POST /api/mfa/totp/confirm ────────────────────────────
@mfa_bp.route('/totp/confirm', methods=['POST'])
@jwt_required()
def totp_confirm():
    user = User.query.get(int(get_jwt_identity()))
    if not user or not user.mfa_secret:
        return jsonify({'error': 'Run /totp/setup first'}), 400
    code = (request.get_json() or {}).get('code', '').strip()
    if not _verify_totp(user.mfa_secret, code):
        return jsonify({'error': 'Invalid code'}), 401
    user.mfa_enabled = True
    user.mfa_method  = 'totp'
    db.session.commit()
    return jsonify({'message': 'Authenticator app linked'}), 200


# ── GET /api/mfa/backup-codes ─────────────────────────────
@mfa_bp.route('/backup-codes', methods=['GET'])
@jwt_required()
def get_backup_codes():
    user  = User.query.get(int(get_jwt_identity()))
    codes = OTPLog.query.filter_by(user_id=user.id, method='backup', status='pending').all()
    if not codes:
        codes = _generate_backup_codes(user.id)
    return jsonify({'backup_codes': [c.code for c in codes]}), 200


# ── POST /api/mfa/backup-codes/verify ────────────────────
@mfa_bp.route('/backup-codes/verify', methods=['POST'])
@jwt_required()
def use_backup_code():
    claims = get_jwt()
    if not claims.get('mfa_pending'):
        return jsonify({'error': 'Not a pre-auth token'}), 403
    user = User.query.get(int(get_jwt_identity()))
    code = (request.get_json() or {}).get('code', '').strip().upper()
    log  = OTPLog.query.filter_by(user_id=user.id, code=code, method='backup', status='pending').first()
    if not log:
        return jsonify({'error': 'Invalid or already used backup code'}), 401
    log.status = 'verified'
    db.session.commit()
    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({'message': 'Backup code accepted',
                    'access_token': access_token, 'refresh_token': refresh_token}), 200


# ── Helpers ───────────────────────────────────────────────
def _generate_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

def _verify_code(user_id, code):
    now = datetime.now(timezone.utc)
    log = OTPLog.query.filter_by(user_id=user_id, code=code, status='pending') \
                      .order_by(OTPLog.timestamp.desc()).first()
    if not log:
        return False
    exp = log.expires_at
    if exp:
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now:
            log.status = 'expired'
            db.session.commit()
            return False
    log.status = 'verified'
    db.session.commit()
    return True

def _verify_totp(secret, code):
    return pyotp.TOTP(secret).verify(code, valid_window=1)

def _log_attempt(user_id, code, method, status, ip):
    db.session.add(OTPLog(user_id=user_id, code=code, method=method, status=status, ip_address=ip))
    db.session.commit()

def _generate_backup_codes(user_id):
    codes = []
    for _ in range(6):
        code = '-'.join(''.join(random.choices(string.ascii_uppercase + string.digits, k=4)) for _ in range(2))
        log  = OTPLog(user_id=user_id, code=code, method='backup', status='pending')
        db.session.add(log)
        codes.append(log)
    db.session.commit()
    return codes

def _mask_email(email):
    local, domain = email.split('@')
    return local[:2] + '***@' + domain

def _mask_phone(phone):
    return (phone[:4] + '****' + phone[-3:]) if phone else '***'
