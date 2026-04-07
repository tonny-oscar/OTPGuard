import bcrypt
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Device, OTPLog, APIKey

users_bp = Blueprint('users', __name__)


# ── GET /api/users/profile ────────────────────────────────
@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


# ── PUT /api/users/profile ────────────────────────────────
@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json() or {}
    if 'full_name' in data: user.full_name = data['full_name'].strip()
    if 'phone'     in data: user.phone     = data['phone'].strip()
    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()}), 200


# ── PUT /api/users/password ───────────────────────────────
@users_bp.route('/password', methods=['PUT'])
@jwt_required()
def change_password():
    user = User.query.get(int(get_jwt_identity()))
    data = request.get_json() or {}
    if not bcrypt.checkpw(data.get('current_password','').encode(), user.password_hash.encode()):
        return jsonify({'error': 'Current password is incorrect'}), 401
    new_pw = data.get('new_password', '')
    if len(new_pw) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400
    user.password_hash = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt()).decode()
    db.session.commit()
    return jsonify({'message': 'Password changed successfully'}), 200


# ── GET/PUT /api/users/settings/mfa ──────────────────────
@users_bp.route('/settings/mfa', methods=['GET', 'PUT'])
@jwt_required()
def mfa_settings():
    user = User.query.get(int(get_jwt_identity()))
    if request.method == 'GET':
        return jsonify({'mfa_enabled': user.mfa_enabled, 'mfa_method': user.mfa_method}), 200
    data = request.get_json() or {}
    if 'mfa_enabled' in data:
        user.mfa_enabled = bool(data['mfa_enabled'])
    if 'mfa_method' in data:
        method = data['mfa_method']
        if method not in ('email', 'sms', 'totp'):
            return jsonify({'error': 'Invalid MFA method'}), 400
        if method == 'sms' and not user.phone:
            return jsonify({'error': 'Add a phone number before enabling SMS OTP'}), 400
        user.mfa_method = method
    db.session.commit()
    return jsonify({'message': 'MFA settings updated', 'mfa_enabled': user.mfa_enabled, 'mfa_method': user.mfa_method}), 200


# ── GET /api/users/devices ────────────────────────────────
@users_bp.route('/devices', methods=['GET'])
@jwt_required()
def get_devices():
    user = User.query.get(int(get_jwt_identity()))
    devices = Device.query.filter_by(user_id=user.id).order_by(Device.last_seen.desc()).all()
    return jsonify({'devices': [d.to_dict() for d in devices]}), 200


# ── PUT /api/users/devices/<id>/trust ────────────────────
@users_bp.route('/devices/<int:device_id>/trust', methods=['PUT'])
@jwt_required()
def trust_device(device_id):
    user   = User.query.get(int(get_jwt_identity()))
    device = Device.query.filter_by(id=device_id, user_id=user.id).first()
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    device.trusted = request.get_json().get('trusted', True)
    db.session.commit()
    return jsonify({'message': 'Device updated', 'device': device.to_dict()}), 200


# ── DELETE /api/users/devices/<id> ───────────────────────
@users_bp.route('/devices/<int:device_id>', methods=['DELETE'])
@jwt_required()
def remove_device(device_id):
    user   = User.query.get(int(get_jwt_identity()))
    device = Device.query.filter_by(id=device_id, user_id=user.id).first()
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    db.session.delete(device)
    db.session.commit()
    return jsonify({'message': 'Device removed'}), 200


# ── GET /api/users/activity ───────────────────────────────
@users_bp.route('/activity', methods=['GET'])
@jwt_required()
def get_activity():
    user = User.query.get(int(get_jwt_identity()))
    logs = OTPLog.query.filter_by(user_id=user.id).order_by(OTPLog.timestamp.desc()).limit(50).all()
    return jsonify({'activity': [l.to_dict() for l in logs]}), 200


# ══════════════════════════════════════════════════════════
#  API KEYS  — businesses use these to call /api/mfa/*
# ══════════════════════════════════════════════════════════

# ── GET /api/users/api-keys ───────────────────────────────
@users_bp.route('/api-keys', methods=['GET'])
@jwt_required()
def list_api_keys():
    user = User.query.get(int(get_jwt_identity()))
    keys = APIKey.query.filter_by(user_id=user.id).order_by(APIKey.created_at.desc()).all()
    return jsonify({'api_keys': [k.to_dict() for k in keys]}), 200


# ── POST /api/users/api-keys ──────────────────────────────
@users_bp.route('/api-keys', methods=['POST'])
@jwt_required()
def create_api_key():
    user = User.query.get(int(get_jwt_identity()))

    # Plan limits
    limits = {'starter': 1, 'growth': 3, 'business': 10}
    limit  = limits.get(user.plan, 1)
    count  = APIKey.query.filter_by(user_id=user.id, is_active=True).count()
    if count >= limit:
        return jsonify({'error': f'Your {user.plan} plan allows max {limit} API key(s). Upgrade to create more.'}), 403

    data = request.get_json() or {}
    name = (data.get('name') or 'My API Key').strip()[:100]
    raw_key = APIKey.generate()

    api_key = APIKey(user_id=user.id, name=name, key=raw_key)
    db.session.add(api_key)
    db.session.commit()

    # Return full key ONCE — never shown again
    return jsonify({
        'message': 'API key created. Copy it now — it will not be shown again.',
        'api_key': {**api_key.to_dict(), 'key': raw_key}
    }), 201


# ── DELETE /api/users/api-keys/<id> ──────────────────────
@users_bp.route('/api-keys/<int:key_id>', methods=['DELETE'])
@jwt_required()
def revoke_api_key(key_id):
    user    = User.query.get(int(get_jwt_identity()))
    api_key = APIKey.query.filter_by(id=key_id, user_id=user.id).first()
    if not api_key:
        return jsonify({'error': 'API key not found'}), 404
    api_key.is_active = False
    db.session.commit()
    return jsonify({'message': 'API key revoked'}), 200


# ── GET /api/users/stats ──────────────────────────────────
@users_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Count OTP logs by status
    total_otps = OTPLog.query.filter_by(user_id=user.id).count()
    verified = OTPLog.query.filter_by(user_id=user.id, status='verified').count()
    failed = OTPLog.query.filter_by(user_id=user.id, status='failed').count()
    
    return jsonify({
        'total_otp_requests': total_otps,
        'verified': verified,
        'failed': failed,
        'mfa_enabled': user.mfa_enabled,
        'api_keys_count': APIKey.query.filter_by(user_id=user.id, is_active=True).count(),
    }), 200


# ── GET /api/users/backup-codes ───────────────────────────
@users_bp.route('/backup-codes', methods=['GET'])
@jwt_required()
def get_backup_codes():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Return placeholder backup codes (you can integrate with real backup code generation)
    # For now, return a message that backup codes are not yet implemented
    return jsonify({
        'backup_codes': [],
        'message': 'Backup codes feature coming soon. Two-factor authentication is enabled.',
        'mfa_enabled': user.mfa_enabled,
    }), 200
