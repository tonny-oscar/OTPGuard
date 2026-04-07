import secrets
from datetime import datetime, timezone
from app.extensions import db


class User(db.Model):
    __tablename__ = 'users'

    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name     = db.Column(db.String(120))
    phone         = db.Column(db.String(20))
    role          = db.Column(db.String(20), default='user')    # user | admin
    plan          = db.Column(db.String(20), default='starter')
    mfa_enabled   = db.Column(db.Boolean, default=False)
    mfa_secret    = db.Column(db.String(64))
    mfa_method    = db.Column(db.String(20), default='email')   # email | sms | totp
    is_active     = db.Column(db.Boolean, default=True)
    created_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    otp_logs = db.relationship('OTPLog',  backref='user', lazy=True, cascade='all, delete-orphan')
    devices  = db.relationship('Device',  backref='user', lazy=True, cascade='all, delete-orphan')
    api_keys = db.relationship('APIKey',  backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':          self.id,
            'email':       self.email,
            'full_name':   self.full_name,
            'phone':       self.phone,
            'role':        self.role,
            'plan':        self.plan,
            'mfa_enabled': self.mfa_enabled,
            'mfa_method':  self.mfa_method,
            'is_active':   self.is_active,
            'created_at':  self.created_at.isoformat(),
        }


class APIKey(db.Model):
    __tablename__ = 'api_keys'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    name       = db.Column(db.String(100), nullable=False)          # e.g. "Production", "Test"
    key        = db.Column(db.String(64), unique=True, nullable=False, index=True)
    is_active  = db.Column(db.Boolean, default=True)
    last_used  = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    @staticmethod
    def generate():
        return 'otpg_' + secrets.token_hex(28)   # e.g. otpg_a3f9...

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'key_preview': self.key[:12] + '••••••••••••••••••••',   # never expose full key
            'is_active':  self.is_active,
            'last_used':  self.last_used.isoformat() if self.last_used else None,
            'created_at': self.created_at.isoformat(),
        }


class OTPLog(db.Model):
    __tablename__ = 'otp_logs'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    api_key_id = db.Column(db.Integer, db.ForeignKey('api_keys.id'), nullable=True)  # set when called via API key
    code       = db.Column(db.String(10), nullable=False)
    method     = db.Column(db.String(20))
    status     = db.Column(db.String(20), default='pending')   # pending | verified | expired | failed
    ip_address = db.Column(db.String(45))
    timestamp  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    expires_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id':         self.id,
            'user_id':    self.user_id,
            'api_key_id': self.api_key_id,
            'method':     self.method,
            'status':     self.status,
            'ip_address': self.ip_address,
            'timestamp':  self.timestamp.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
        }


class Device(db.Model):
    __tablename__ = 'devices'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    ip         = db.Column(db.String(45))
    location   = db.Column(db.String(120))
    user_agent = db.Column(db.String(255))
    trusted    = db.Column(db.Boolean, default=False)
    last_seen  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id':         self.id,
            'user_id':    self.user_id,
            'ip':         self.ip,
            'location':   self.location,
            'user_agent': self.user_agent,
            'trusted':    self.trusted,
            'last_seen':  self.last_seen.isoformat(),
            'created_at': self.created_at.isoformat(),
        }
