import bcrypt
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Device, OTPLog, APIKey

users_bp = Blueprint('users', __name__)


@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get current user profile
    ---
    tags: [User Settings]
    security: [{ Bearer: [] }]
    responses:
      200: { description: User profile data }
    """
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


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


@users_bp.route('/password', methods=['PUT'])
@jwt_required()
def change_password():
    user = User.query.get(int(get_jwt_identity()))
    data = request.get_json() or {}
    if not bcrypt.checkpw(data.get('current_password', '').encode(), user.password_hash.encode()):
        return jsonify({'error': 'Current password is incorrect'}), 401
    new_pw = data.get('new_password', '')
    if len(new_pw) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400
    user.password_hash = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt()).decode()
    db.session.commit()
    return jsonify({'message': 'Password changed successfully'}), 200


@users_bp.route('/settings/mfa', methods=['GET', 'PUT'])
@jwt_required()
def mfa_settings():
    """
    Get or update MFA settings
    ---
    tags: [User Settings]
    security: [{ Bearer: [] }]
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            mfa_enabled: { type: boolean }
            mfa_method:  { type: string, enum: [email, sms, totp] }
    responses:
      200: { description: MFA settings }
    """
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


@users_bp.route('/devices', methods=['GET'])
@jwt_required()
def get_devices():
    user    = User.query.get(int(get_jwt_identity()))
    devices = Device.query.filter_by(user_id=user.id).order_by(Device.last_seen.desc()).all()
    return jsonify({'devices': [d.to_dict() for d in devices]}), 200


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


@users_bp.route('/activity', methods=['GET'])
@jwt_required()
def get_activity():
    user = User.query.get(int(get_jwt_identity()))
    logs = OTPLog.query.filter_by(user_id=user.id).order_by(OTPLog.timestamp.desc()).limit(50).all()
    return jsonify({'activity': [l.to_dict() for l in logs], 'preview_limit': 5}), 200


@users_bp.route('/api-keys', methods=['GET'])
@jwt_required()
def list_api_keys():
    user = User.query.get(int(get_jwt_identity()))
    keys = APIKey.query.filter_by(user_id=user.id, is_active=True).order_by(APIKey.created_at.desc()).all()
    return jsonify({'api_keys': [k.to_dict() for k in keys]}), 200


@users_bp.route('/api-keys', methods=['POST'])
@jwt_required()
def create_api_key():
    """
    Create a new API key
    ---
    tags: [API Keys]
    security: [{ Bearer: [] }]
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            name: { type: string, example: Production }
    responses:
      201: { description: API key created (shown once) }
      403: { description: Plan limit reached }
    """
    user   = User.query.get(int(get_jwt_identity()))
    limits = {'starter': 1, 'growth': 3, 'business': 10}
    limit  = limits.get(user.plan, 1)
    count  = APIKey.query.filter_by(user_id=user.id, is_active=True).count()
    if count >= limit:
        return jsonify({'error': f'Your {user.plan} plan allows max {limit} API key(s). Upgrade to create more.'}), 403

    data    = request.get_json() or {}
    name    = (data.get('name') or 'My API Key').strip()[:100]
    raw_key = APIKey.generate()

    api_key = APIKey(user_id=user.id, name=name, key=raw_key)
    db.session.add(api_key)
    db.session.commit()

    return jsonify({
        'message': 'API key created. Copy it now — it will not be shown again.',
        'api_key': {**api_key.to_dict(), 'key': raw_key}
    }), 201


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


@users_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    verified = OTPLog.query.filter_by(user_id=user.id, status='verified').count()
    failed   = OTPLog.query.filter_by(user_id=user.id, status='failed').count()
    devices  = Device.query.filter_by(user_id=user.id, trusted=True).count()
    keys     = APIKey.query.filter_by(user_id=user.id, is_active=True).count()

    return jsonify({
        'stats': [
            {'icon': '🔐', 'label': 'MFA Status',      'val': 'Active' if user.mfa_enabled else 'Disabled', 'color': 'var(--green)' if user.mfa_enabled else '#f87171'},
            {'icon': '📱', 'label': 'MFA Method',      'val': (user.mfa_method or '—').upper(),              'color': 'var(--blue)'},
            {'icon': '💻', 'label': 'Trusted Devices', 'val': devices,                                        'color': 'var(--green)'},
            {'icon': '🔑', 'label': 'API Keys',        'val': keys,                                           'color': '#facc15'},
        ]
    }), 200


@users_bp.route('/backup-codes', methods=['GET'])
@jwt_required()
def get_backup_codes():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    from app.models import OTPLog
    codes = OTPLog.query.filter_by(user_id=user.id, method='backup', status='pending').all()
    return jsonify({'backup_codes': [c.code for c in codes]}), 200
