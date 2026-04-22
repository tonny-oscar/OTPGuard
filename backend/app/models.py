import secrets
from datetime import datetime, timezone
from app.extensions import db


<<<<<<< HEAD
=======
# ══════════════════════════════════════════════════════════
#  SUBSCRIPTION MODELS
# ══════════════════════════════════════════════════════════

class Plan(db.Model):
    __tablename__ = 'plans'

    id              = db.Column(db.Integer, primary_key=True)
    name            = db.Column(db.String(50), unique=True, nullable=False)  # starter, growth, business, enterprise
    display_name    = db.Column(db.String(100), nullable=False)  # "Starter", "Growth (Most Popular)"
    price_kes       = db.Column(db.Integer, default=0)  # Price in KES (cents)
    price_usd       = db.Column(db.Integer, default=0)  # Price in USD (cents)
    max_users       = db.Column(db.Integer, default=50)  # -1 for unlimited
    otp_channels    = db.Column(db.JSON, default=lambda: ["email"])  # ["email", "sms", "totp"]
    features        = db.Column(db.JSON, default=lambda: ["basic_dashboard"])  # Feature flags
    sms_enabled     = db.Column(db.Boolean, default=False)
    sms_cost_min    = db.Column(db.Integer, default=0)  # Min SMS cost in KES (cents)
    sms_cost_max    = db.Column(db.Integer, default=0)  # Max SMS cost in KES (cents)
    is_active       = db.Column(db.Boolean, default=True)
    created_at      = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    subscriptions = db.relationship('Subscription', backref='plan', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'display_name': self.display_name,
            'price_kes': self.price_kes,
            'price_usd': self.price_usd,
            'max_users': self.max_users,
            'otp_channels': self.otp_channels,
            'features': self.features,
            'sms_enabled': self.sms_enabled,
            'sms_cost_range': f"{self.sms_cost_min/100:.2f}-{self.sms_cost_max/100:.2f} KES" if self.sms_enabled else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }


class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    plan_id     = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    status      = db.Column(db.String(20), default='active')  # active, trial, expired, cancelled
    start_date  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    end_date    = db.Column(db.DateTime)  # None for active subscriptions
    trial_ends  = db.Column(db.DateTime)  # For trial periods
    auto_renew  = db.Column(db.Boolean, default=True)
    created_at  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = db.relationship('User', backref='subscriptions')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan': self.plan.to_dict() if self.plan else None,
            'status': self.status,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'trial_ends': self.trial_ends.isoformat() if self.trial_ends else None,
            'auto_renew': self.auto_renew,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @property
    def is_active(self):
        now = datetime.now(timezone.utc)
        if self.status == 'expired' or self.status == 'cancelled':
            return False
        if self.end_date and self.end_date < now:
            return False
        return True

    @property
    def is_trial(self):
        if not self.trial_ends:
            return False
        return datetime.now(timezone.utc) < self.trial_ends


class UsageLog(db.Model):
    __tablename__ = 'usage_logs'

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    usage_type  = db.Column(db.String(20), nullable=False)  # email_otp, sms_otp, totp_verify, user_added
    quantity    = db.Column(db.Integer, default=1)
    cost_kes    = db.Column(db.Integer, default=0)  # Cost in KES (cents)
    extra_data  = db.Column(db.JSON)  # Additional data (phone number, email, etc.)
    timestamp   = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    user = db.relationship('User', backref='usage_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'usage_type': self.usage_type,
            'quantity': self.quantity,
            'cost_kes': self.cost_kes / 100,  # Convert to KES
            'extra_data': self.extra_data,
            'timestamp': self.timestamp.isoformat()
        }


class UsageSummary(db.Model):
    __tablename__ = 'usage_summaries'

    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    month           = db.Column(db.String(7), nullable=False)  # YYYY-MM format
    total_users     = db.Column(db.Integer, default=0)
    email_otp_count = db.Column(db.Integer, default=0)
    sms_otp_count   = db.Column(db.Integer, default=0)
    totp_count      = db.Column(db.Integer, default=0)
    total_cost_kes  = db.Column(db.Integer, default=0)  # Total cost in KES (cents)
    created_at      = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at      = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = db.relationship('User', backref='usage_summaries')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'month': self.month,
            'total_users': self.total_users,
            'email_otp_count': self.email_otp_count,
            'sms_otp_count': self.sms_otp_count,
            'totp_count': self.totp_count,
            'total_cost_kes': self.total_cost_kes / 100,  # Convert to KES
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


# ══════════════════════════════════════════════════════════
#  EXISTING USER MODELS (UPDATED)
# ══════════════════════════════════════════════════════════


>>>>>>> 1f4cbb51fd987e42431dc6d7ec94123832402637
class User(db.Model):
    __tablename__ = 'users'

    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name     = db.Column(db.String(120))
    phone         = db.Column(db.String(20))
    role          = db.Column(db.String(20), default='user')    # user | admin
<<<<<<< HEAD
    plan          = db.Column(db.String(20), default='starter')
=======
    plan          = db.Column(db.String(20), default='starter')  # DEPRECATED: Use subscription relationship
>>>>>>> 1f4cbb51fd987e42431dc6d7ec94123832402637
    mfa_enabled   = db.Column(db.Boolean, default=False)
    mfa_secret    = db.Column(db.String(64))
    mfa_method    = db.Column(db.String(20), default='email')   # email | sms | totp
    is_active     = db.Column(db.Boolean, default=True)
    created_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

<<<<<<< HEAD
=======
    # Relationships
>>>>>>> 1f4cbb51fd987e42431dc6d7ec94123832402637
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
<<<<<<< HEAD
            'plan':        self.plan,
=======
            'plan':        self.plan,  # Keep for backward compatibility
>>>>>>> 1f4cbb51fd987e42431dc6d7ec94123832402637
            'mfa_enabled': self.mfa_enabled,
            'mfa_method':  self.mfa_method,
            'is_active':   self.is_active,
            'created_at':  self.created_at.isoformat(),
        }

<<<<<<< HEAD
=======
    @property
    def current_subscription(self):
        """Get the user's current active subscription"""
        return Subscription.query.filter_by(
            user_id=self.id, 
            status='active'
        ).order_by(Subscription.created_at.desc()).first()

    @property
    def current_plan(self):
        """Get the user's current plan through subscription"""
        subscription = self.current_subscription
        return subscription.plan if subscription else None

    def has_feature(self, feature_name):
        """Check if user's plan includes a specific feature"""
        plan = self.current_plan
        if not plan:
            return False
        return feature_name in (plan.features or [])

    def can_use_channel(self, channel):
        """Check if user's plan allows a specific OTP channel"""
        plan = self.current_plan
        if not plan:
            return channel == 'email'  # Default fallback
        return channel in (plan.otp_channels or ['email'])

    def get_user_count(self):
        """Get current number of users for this account (for API key usage)"""
        # For external API usage, count unique identifiers in OTP logs
        from sqlalchemy import func, distinct
        return db.session.query(func.count(distinct(OTPLog.user_id))).filter(
            OTPLog.api_key_id.in_([key.id for key in self.api_keys])
        ).scalar() or 0

>>>>>>> 1f4cbb51fd987e42431dc6d7ec94123832402637

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
