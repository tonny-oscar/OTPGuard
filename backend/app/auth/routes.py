from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
import bcrypt

from app.extensions import db
from app.models import User, Device
from app.utils import get_client_ip, get_location

auth_bp = Blueprint("auth", __name__)


# ── POST /api/auth/register ───────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email     = (data.get("email") or "").strip().lower()
    password  = data.get("password") or ""
    full_name = data.get("full_name") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

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
