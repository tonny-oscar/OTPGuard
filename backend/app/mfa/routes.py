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
from app.subscription.middleware import rate_limit_otp, log_api_usage
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
        key.last_used = datetime.now(timezone.utc)
        db.session.commit()
        request.api_key = key
        return fn(*args, **kwargs)
    return wrapper


# ══════════════════════════════════════════════════════════
#  EXTERNAL API  — called by businesses via API key
# ══════════════════════════════════════════════════════════

@mfa_bp.route('/otp/send', methods=['POST'])
@api_key_required
@rate_limit_otp(max_requests=10, window_minutes=5)
@log_api_usage('email_otp')
def external_send_otp():
    """
    Send OTP via SMS or Email (API Key auth)
    ---
    tags: [OTP - External API]
    parameters:
      - in: header
        name: X-API-Key
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            method:  { type: string, enum: [sms, email], example: sms }
            phone:   { type: string, example: "+254700000000" }
            email:   { type: string, example: user@example.com }
    responses:
      200: { description: OTP sent successfully }
      400: { description: Validation error }
      403: { description: Plan does not support this channel }
    """
    data   = request.get_json() or {}
    phone  = data.get('phone', '').strip()
    email  = data.get('email', '').strip().lower()
    method = data.get('method', 'sms').strip()

    if method not in ('sms', 'email'):
        return jsonify({'error': 'method must be sms or email'}), 400
    if method == 'sms' and not phone:
        return jsonify({'error': 'phone is required for SMS'}), 400
    if method == 'email' and not email:
        return jsonify({'error': 'email is required for email OTP'}), 400

    api_key_owner = User.query.get(request.api_key.user_id)
    if not api_key_owner.can_use_channel(method):
        return jsonify({'error': f'Your plan does not support {method} OTP', 'code': 'CHANNEL_NOT_AVAILABLE'}), 403

    allowed, message = SubscriptionService.check_user_limit(request.api_key.user_id)
    if not allowed:
        return jsonify({'error': message, 'code': 'USER_LIMIT_REACHED'}), 403

    identifier = phone if method == 'sms' else email
    user = User.query.filter_by(email=identifier).first()
    if not user:
        user = User(
            email=identifier, password_hash='__external__',
            full_name='External User', phone=phone,
            role='user', plan='starter', mfa_enabled=True
        )
        db.session.add(user)
        db.session.commit()

    code   = _generate_code(current_app.config['OTP_LENGTH'])
    expiry = datetime.now(timezone.utc) + timedelta(seconds=current_app.config['OTP_EXPIRY_SECONDS'])

    OTPLog.query.filter_by(user_id=user.id, status='pending').update({'status': 'expired'})
    db.session.commit()

    log = OTPLog(user_id=user.id, api_key_id=request.api_key.id,
                 code=code, method=method, status='pending',
                 ip_address=request.remote_addr, expires_at=expiry)
    db.session.add(log)
    db.session.commit()

    if method == 'email':
        send_email_otp(email, code)
    else:
        send_sms_otp(phone, code)

    return jsonify({
        'message':    f'OTP sent via {method}',
        'expires_in': current_app.config['OTP_EXPIRY_SECONDS'],
        'otp_id':     log.id,
    }), 200


@mfa_bp.route('/otp/verify', methods=['POST'])
@api_key_required
def external_verify_otp():
    """
    Verify OTP code (API Key auth)
    ---
    tags: [OTP - External API]
    parameters:
      - in: header
        name: X-API-Key
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            method: { type: string, enum: [sms, email] }
            phone:  { type: string }
            email:  { type: string }
            code:   { type: string, example: "123456" }
    responses:
      200: { description: OTP verified }
      401: { description: Invalid or expired OTP }
    """
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

@mfa_bp.route('/send', methods=['POST'])
@jwt_required()
def send_otp():
    """
    Send OTP for MFA login (pre-auth token)
    ---
    tags: [MFA - Internal]
    security: [{ Bearer: [] }]
    responses:
      200: { description: OTP sent }
      400: { description: Invalid method or missing phone }
      403: { description: Not a pre-auth token }
    """
    claims = get_jwt()
    if not claims.get('mfa_pending'):
        return jsonify({'error': 'Not a pre-auth token'}), 403

    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.mfa_method == 'totp':
        return jsonify({'error': 'Use your authenticator app'}), 400
    if user.mfa_method == 'sms' and not user.phone:
        return jsonify({'error': 'Phone number required for SMS OTP'}), 400

    code   = _generate_code(current_app.config['OTP_LENGTH'])
    expiry = datetime.now(timezone.utc) + timedelta(seconds=current_app.config['OTP_EXPIRY_SECONDS'])

    OTPLog.query.filter_by(user_id=user.id, status='pending').update({'status': 'expired'})
    db.session.commit()

    log = OTPLog(user_id=user.id, code=code, method=user.mfa_method,
                 status='pending', ip_address=request.remote_addr, expires_at=expiry)
    db.session.add(log)
    db.session.commit()

    try:
        if user.mfa_method == 'email':
            send_email_otp(user.email, code)
            dest = _mask_email(user.email)
        else:
            send_sms_otp(user.phone, code)
            dest = _mask_phone(user.phone)
        return jsonify({'message': f'OTP sent to {dest}', 'method': user.mfa_method,
                        'expires_in': current_app.config['OTP_EXPIRY_SECONDS']}), 200
    except Exception as e:
        current_app.logger.error(f"[SEND] Failed: {e}")
        return jsonify({'error': f'Failed to send OTP: {e}'}), 500


@mfa_bp.route('/resend', methods=['POST'])
@jwt_required()
def resend_otp():
    """
    Resend OTP (rate limited to 4 per 15 min)
    ---
    tags: [MFA - Internal]
    security: [{ Bearer: [] }]
    responses:
      200: { description: OTP resent }
      429: { description: Too many resend attempts }
    """
    claims = get_jwt()
    if not claims.get('mfa_pending'):
        return jsonify({'error': 'Not a pre-auth token'}), 403

    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.mfa_method == 'totp':
        return jsonify({'error': 'Use your authenticator app'}), 400

    now = datetime.now(timezone.utc)
    recent = OTPLog.query.filter(
        OTPLog.user_id == user.id,
        OTPLog.timestamp > now - timedelta(minutes=15),
        OTPLog.method != 'backup'
    ).count()
    if recent >= 4:
        return jsonify({'error': 'Too many resend attempts. Try again in 15 minutes', 'retry_after': 900}), 429

    if user.mfa_method == 'sms' and not user.phone:
        return jsonify({'error': 'Phone number required for SMS OTP'}), 400

    code   = _generate_code(current_app.config['OTP_LENGTH'])
    expiry = datetime.now(timezone.utc) + timedelta(seconds=current_app.config['OTP_EXPIRY_SECONDS'])

    OTPLog.query.filter_by(user_id=user.id, status='pending').update({'status': 'expired'})
    db.session.commit()

    log = OTPLog(user_id=user.id, code=code, method=user.mfa_method,
                 status='pending', ip_address=request.remote_addr, expires_at=expiry)
    db.session.add(log)
    db.session.commit()

    try:
        if user.mfa_method == 'email':
            send_email_otp(user.email, code)
            dest = _mask_email(user.email)
        else:
            send_sms_otp(user.phone, code)
            dest = _mask_phone(user.phone)
        return jsonify({'message': f'OTP resent to {dest}', 'method': user.mfa_method,
                        'expires_in': current_app.config['OTP_EXPIRY_SECONDS']}), 200
    except Exception as e:
        current_app.logger.error(f"[RESEND] Failed: {e}")
        return jsonify({'error': f'Failed to send OTP: {e}'}), 500


@mfa_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_otp():
    """
    Verify OTP and complete MFA login
    ---
    tags: [MFA - Internal]
    security: [{ Bearer: [] }]
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            code: { type: string, example: "123456" }
    responses:
      200: { description: MFA verified, returns access token }
      401: { description: Invalid or expired OTP }
    """
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


@mfa_bp.route('/totp/setup', methods=['POST'])
@jwt_required()
def totp_setup():
    """
    Generate TOTP secret and QR code URI
    ---
    tags: [MFA - TOTP]
    security: [{ Bearer: [] }]
    responses:
      200: { description: TOTP secret and provisioning URI }
    """
    user = User.query.get(int(get_jwt_identity()))
    secret = pyotp.random_base32()
    uri    = pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name='OTPGuard')
    user.mfa_secret = secret
    db.session.commit()
    return jsonify({'secret': secret, 'provisioning_uri': uri}), 200


@mfa_bp.route('/totp/confirm', methods=['POST'])
@jwt_required()
def totp_confirm():
    """
    Confirm TOTP setup with a valid code
    ---
    tags: [MFA - TOTP]
    security: [{ Bearer: [] }]
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            code: { type: string, example: "123456" }
    responses:
      200: { description: Authenticator app linked }
      401: { description: Invalid code }
    """
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


@mfa_bp.route('/backup-codes', methods=['GET'])
@jwt_required()
def get_backup_codes():
    """
    Get or generate backup codes
    ---
    tags: [MFA - Backup Codes]
    security: [{ Bearer: [] }]
    responses:
      200: { description: List of backup codes }
    """
    user  = User.query.get(int(get_jwt_identity()))
    codes = OTPLog.query.filter_by(user_id=user.id, method='backup', status='pending').all()
    if not codes:
        codes = _generate_backup_codes(user.id)
    return jsonify({'backup_codes': [c.code for c in codes]}), 200


@mfa_bp.route('/backup-codes/verify', methods=['POST'])
@jwt_required()
def use_backup_code():
    """
    Use a backup code to complete MFA login
    ---
    tags: [MFA - Backup Codes]
    security: [{ Bearer: [] }]
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            code: { type: string, example: ABCD-1234 }
    responses:
      200: { description: Backup code accepted, returns tokens }
      401: { description: Invalid or used backup code }
    """
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
