from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from sqlalchemy import or_
import bcrypt

from app.extensions import db
from app.models import User, Device
from app.utils import get_client_ip, get_location

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user account
    ---
    tags: [Authentication]
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [email, password]
          properties:
            email:     { type: string, example: user@example.com }
            password:  { type: string, example: password123 }
            full_name: { type: string, example: John Doe }
            phone:     { type: string, example: "+254700000000" }
            plan:      { type: string, example: starter }
    responses:
      201: { description: Account created }
      400: { description: Validation error }
      409: { description: Email already registered }
    """
    data      = request.get_json() or {}
    email     = (data.get("email") or "").strip().lower()
    phone     = (data.get("phone") or "").strip()
    password  = data.get("password") or ""
    full_name = (data.get("full_name") or "").strip()
    plan      = (data.get("plan") or "starter").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409
    if phone and User.query.filter_by(phone=phone).first():
        return jsonify({"error": "Phone number already registered"}), 409

    pw_hash    = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    mfa_method = 'sms' if phone else 'email'

    user = User(
        email=email, password_hash=pw_hash, full_name=full_name,
        plan=plan, phone=phone, mfa_method=mfa_method, mfa_enabled=True,
    )
    db.session.add(user)
    db.session.commit()

    # Auto-create starter subscription for new user
    try:
        from app.subscription.service import SubscriptionService
        SubscriptionService.create_subscription(user.id, plan)
    except Exception:
        pass  # Non-fatal: user can still log in

    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "Account created successfully",
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login with email/phone and password
    ---
    tags: [Authentication]
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [email, password]
          properties:
            email:    { type: string, example: user@example.com }
            password: { type: string, example: password123 }
    responses:
      200: { description: Login successful or MFA required }
      401: { description: Invalid credentials }
      403: { description: Account disabled }
    """
    data       = request.get_json() or {}
    identifier = (data.get("identifier") or data.get("email") or "").strip()
    password   = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "Email/phone and password are required"}), 400

    user = User.query.filter(
        or_(User.email == identifier.lower(), User.phone == identifier)
    ).first()

    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.is_active:
        return jsonify({"error": "Account is disabled"}), 403

    ip       = get_client_ip(request)
    location = get_location(ip)
    _upsert_device(user.id, ip, location, request.user_agent.string)

    if user.mfa_enabled and user.role != 'admin':
        import datetime
        pre_auth = create_access_token(
            identity=str(user.id),
            additional_claims={"mfa_pending": True},
            expires_delta=datetime.timedelta(minutes=10)
        )
        return jsonify({
            "mfa_required": True,
            "mfa_method": user.mfa_method,
            "pre_auth_token": pre_auth,
        }), 200

    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "mfa_required": False,
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token
    ---
    tags: [Authentication]
    security: [{ Bearer: [] }]
    responses:
      200: { description: New access token }
      401: { description: Invalid refresh token }
    """
    access_token = create_access_token(identity=get_jwt_identity())
    return jsonify({"access_token": access_token}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """
    Get current authenticated user
    ---
    tags: [Authentication]
    security: [{ Bearer: [] }]
    responses:
      200: { description: Current user data }
      404: { description: User not found }
    """
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


def _upsert_device(user_id, ip, location, user_agent):
    from datetime import datetime, timezone
    device = Device.query.filter_by(user_id=user_id, ip=ip).first()
    if device:
        device.last_seen = datetime.now(timezone.utc)
    else:
        device = Device(user_id=user_id, ip=ip, location=location,
                        user_agent=user_agent, trusted=False)
        db.session.add(device)
    db.session.commit()
