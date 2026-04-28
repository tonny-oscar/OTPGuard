import secrets
import json
from datetime import datetime, timezone
from app.extensions import db


class User(db.Model):
    __tablename__ = 'users'

    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name     = db.Column(db.String(120))
    phone         = db.Column(db.String(20))
    role          = db.Column(db.String(20), default='user')
    plan          = db.Column(db.String(20), default='starter')
    mfa_enabled   = db.Column(db.Boolean, default=False)
    mfa_secret    = db.Column(db.String(64))
    mfa_method    = db.Column(db.String(20), default='email')
    is_active     = db.Column(db.Boolean, default=True)
    created_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    otp_logs      = db.relationship('OTPLog',      backref='user', lazy=True, cascade='all, delete-orphan')
    devices       = db.relationship('Device',      backref='user', lazy=True, cascade='all, delete-orphan')
    api_keys      = db.relationship('APIKey',      backref='user', lazy=True, cascade='all, delete-orphan')
    subscriptions = db.relationship('Subscription', backref='user', lazy=True, cascade='all, delete-orphan')
    usage_logs    = db.relationship('UsageLog',    backref='user', lazy=True, cascade='all, delete-orphan')

    @property
    def current_subscription(self):
        return Subscription.query.filter(
            Subscription.user_id == self.id,
            Subscription.status.in_(['active', 'trial'])
        ).order_by(Subscription.created_at.desc()).first()

    @property
    def current_plan(self):
        sub = self.current_subscription
        if sub:
            return sub.plan
        return Plan.query.filter_by(name=self.plan).first()

    def can_use_channel(self, channel):
        plan = self.current_plan
        if not plan:
            return channel == 'email'
        return channel in (plan.otp_channels or ['email'])

    def has_feature(self, feature):
        plan = self.current_plan
        if not plan:
            return feature == 'basic_dashboard'
        return feature in (plan.features or ['basic_dashboard'])

    def get_user_count(self):
        return OTPLog.query.filter_by(user_id=self.id).count()

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
    name       = db.Column(db.String(100), nullable=False)
    key        = db.Column(db.String(64), unique=True, nullable=False, index=True)
    is_active  = db.Column(db.Boolean, default=True)
    last_used  = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    @staticmethod
    def generate():
        return 'otpg_' + secrets.token_hex(28)

    def to_dict(self):
        return {
            'id':          self.id,
            'name':        self.name,
            'key_preview': self.key[:12] + '••••••••••••••••••••',
            'is_active':   self.is_active,
            'last_used':   self.last_used.isoformat() if self.last_used else None,
            'created_at':  self.created_at.isoformat(),
        }


class OTPLog(db.Model):
    __tablename__ = 'otp_logs'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    api_key_id = db.Column(db.Integer, db.ForeignKey('api_keys.id'), nullable=True)
    code       = db.Column(db.String(10), nullable=False)
    method     = db.Column(db.String(20))
    status     = db.Column(db.String(20), default='pending')
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


class Plan(db.Model):
    __tablename__ = 'plans'

    id           = db.Column(db.Integer, primary_key=True)
    name         = db.Column(db.String(50), unique=True, nullable=False)
    display_name = db.Column(db.String(100))
    price_kes    = db.Column(db.Integer, default=0)
    price_usd    = db.Column(db.Integer, default=0)
    max_users    = db.Column(db.Integer, default=50)
    _otp_channels = db.Column('otp_channels', db.Text, default='["email"]')
    _features    = db.Column('features', db.Text, default='["basic_dashboard"]')
    sms_enabled  = db.Column(db.Boolean, default=False)
    sms_cost_min = db.Column(db.Integer, default=0)
    sms_cost_max = db.Column(db.Integer, default=0)
    is_active    = db.Column(db.Boolean, default=True)
    created_at   = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    subscriptions = db.relationship('Subscription', backref='plan', lazy=True)

    @property
    def otp_channels(self):
        try:
            return json.loads(self._otp_channels) if self._otp_channels else ['email']
        except Exception:
            return ['email']

    @otp_channels.setter
    def otp_channels(self, value):
        self._otp_channels = json.dumps(value)

    @property
    def features(self):
        try:
            return json.loads(self._features) if self._features else ['basic_dashboard']
        except Exception:
            return ['basic_dashboard']

    @features.setter
    def features(self, value):
        self._features = json.dumps(value)

    def __init__(self, **kwargs):
        channels = kwargs.pop('otp_channels', ['email'])
        features = kwargs.pop('features', ['basic_dashboard'])
        super().__init__(**kwargs)
        self.otp_channels = channels
        self.features = features

    def to_dict(self):
        return {
            'id':           self.id,
            'name':         self.name,
            'display_name': self.display_name,
            'price_kes':    self.price_kes,
            'price_usd':    self.price_usd,
            'max_users':    self.max_users,
            'otp_channels': self.otp_channels,
            'features':     self.features,
            'sms_enabled':  self.sms_enabled,
        }


class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    plan_id    = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    status     = db.Column(db.String(20), default='active')  # active | trial | cancelled | expired
    is_trial   = db.Column(db.Boolean, default=False)
    trial_ends = db.Column(db.DateTime)
    end_date   = db.Column(db.DateTime)
    auto_renew = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    @property
    def is_active(self):
        if self.status == 'active':
            return True
        if self.status == 'trial':
            if self.trial_ends:
                te = self.trial_ends
                if te.tzinfo is None:
                    te = te.replace(tzinfo=timezone.utc)
                return te > datetime.now(timezone.utc)
        return False

    def to_dict(self):
        return {
            'id':         self.id,
            'user_id':    self.user_id,
            'plan_id':    self.plan_id,
            'status':     self.status,
            'is_trial':   self.is_trial,
            'trial_ends': self.trial_ends.isoformat() if self.trial_ends else None,
            'end_date':   self.end_date.isoformat() if self.end_date else None,
            'auto_renew': self.auto_renew,
            'created_at': self.created_at.isoformat(),
        }


class UsageLog(db.Model):
    __tablename__ = 'usage_logs'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    usage_type = db.Column(db.String(50))
    quantity   = db.Column(db.Integer, default=1)
    cost_kes   = db.Column(db.Integer, default=0)
    _extra_data = db.Column('extra_data', db.Text, default='{}')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    @property
    def extra_data(self):
        try:
            return json.loads(self._extra_data) if self._extra_data else {}
        except Exception:
            return {}

    @extra_data.setter
    def extra_data(self, value):
        self._extra_data = json.dumps(value or {})

    def __init__(self, **kwargs):
        extra = kwargs.pop('extra_data', {})
        super().__init__(**kwargs)
        self.extra_data = extra


class UsageSummary(db.Model):
    __tablename__ = 'usage_summaries'

    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    month           = db.Column(db.String(7))  # YYYY-MM
    email_otp_count = db.Column(db.Integer, default=0)
    sms_otp_count   = db.Column(db.Integer, default=0)
    totp_count      = db.Column(db.Integer, default=0)
    total_users     = db.Column(db.Integer, default=0)
    total_cost_kes  = db.Column(db.Integer, default=0)
    updated_at      = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'month':           self.month,
            'email_otp_count': self.email_otp_count,
            'sms_otp_count':   self.sms_otp_count,
            'totp_count':      self.totp_count,
            'total_users':     self.total_users,
            'total_cost_kes':  self.total_cost_kes / 100,
        }
