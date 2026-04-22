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


# ── POST /api/auth/register ───────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():

    """
    Register a new user account
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            email:
              type: string
              example: "user@example.com"
            phone:
              type: string
              example: "+254700000000"
            password:
              type: string
              example: "SecurePass123!"
            full_name:
              type: string
              example: "John Doe"
            plan:
              type: string
              enum: [starter, professional, enterprise]
              example: "starter"
    responses:
      201:
        description: Account created successfully
        schema:
          properties:
            message:
              type: string
            user:
              type: object
            access_token:
              type: string
            refresh_token:
              type: string
      400:
        description: Validation error
      409:
        description: Email or phone already registered
    """
    data = request.get_json() or {}
    email     = (data.get("email") or "").strip().lower()
    phone     = (data.get("phone") or "").strip()
    password  = data.get("password") or ""
    full_name = data.get("full_name") or ""

    if not email and not phone:
        return jsonify({"error": "Email or phone number is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400

    data = request.get_json()
    email     = (data.get("email") or "").strip().lower()
    password  = data.get("password") or ""
    full_name = data.get("full_name") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400


    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400


    if phone and User.query.filter_by(phone=phone).first():
        return jsonify({"error": "Phone number already registered"}), 409
    if email and User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    if not email:
        email = f"{phone}@otpguard.local"

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    plan    = (data.get('plan') or 'starter').strip().lower()
    mfa_method = 'sms' if phone else 'email'
    mfa_enabled = True  # Always enable MFA for all users

    user = User(
        email=email,
        password_hash=pw_hash,
        full_name=full_name,
        plan=plan,
        phone=phone,
        mfa_method=mfa_method,
        mfa_enabled=mfa_enabled
    )

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    plan    = (data.get('plan') or 'starter').strip().lower()
    phone   = (data.get('phone') or '').strip()
    user = User(email=email, password_hash=pw_hash, full_name=full_name, plan=plan, phone=phone)

    db.session.add(user)
    db.session.commit()

    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message":       "Account created successfully",
        "user":          user.to_dict(),
        "access_token":  access_token,
        "refresh_token": refresh_token,
    }), 201


# ── POST /api/auth/login ──────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():

    """
    Login user with email/phone and password
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            identifier:
              type: string
              example: "user@example.com"
              description: "Email or phone number"
            password:
              type: string
              example: "SecurePass123!"
    responses:
      200:
        description: Login successful
        schema:
          properties:
            mfa_required:
              type: boolean
            mfa_method:
              type: string
              enum: [email, sms, totp]
            pre_auth_token:
              type: string
              description: "Only if MFA required"
            user:
              type: object
              description: "Only if MFA not required"
            access_token:
              type: string
              description: "Only if MFA not required"
            refresh_token:
              type: string
              description: "Only if MFA not required"
      401:
        description: Invalid credentials
      403:
        description: Account disabled
    """
    data       = request.get_json() or {}
    identifier = (data.get("identifier") or data.get("email") or "").strip()
    password   = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "Identifier and password are required"}), 400

    query_value = identifier.lower() if "@" in identifier else identifier
    user = User.query.filter(
        or_(User.email == query_value.lower(), User.phone == identifier)
    ).first()

    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({"error": "Invalid email, phone number, or password"}), 401

    data     = request.get_json()
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({"error": "Invalid email or password"}), 401


    if not user.is_active:
        return jsonify({"error": "Account is disabled"}), 403

    # ── Log / update device ───────────────────────────────
    ip       = get_client_ip(request)
    location = get_location(ip)
    _upsert_device(user.id, ip, location, request.user_agent.string)

    # ── MFA required? (skip for admin) ──────────────────
    if user.mfa_enabled and user.role != 'admin':
        # Return a short-lived pre-auth token — frontend uses this to call /mfa/send
        pre_auth = create_access_token(
            identity=str(user.id),
            additional_claims={"mfa_pending": True},
            expires_delta=__import__("datetime").timedelta(minutes=10)
        )
        return jsonify({
            "mfa_required":  True,
            "mfa_method":    user.mfa_method,
            "pre_auth_token": pre_auth,
        }), 200

    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "mfa_required":  False,
        "user":          user.to_dict(),
        "access_token":  access_token,
        "refresh_token": refresh_token,
    }), 200


# ── POST /api/auth/refresh ────────────────────────────────
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id      = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token}), 200


# ── GET /api/auth/me ──────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


# ── Helpers ───────────────────────────────────────────────
def _upsert_device(user_id, ip, location, user_agent):
    device = Device.query.filter_by(user_id=user_id, ip=ip).first()
    if device:
        from datetime import datetime, timezone
        device.last_seen = datetime.now(timezone.utc)
    else:
        device = Device(user_id=user_id, ip=ip, location=location,
                        user_agent=user_agent, trusted=False)
        db.session.add(device)
    db.session.commit()
