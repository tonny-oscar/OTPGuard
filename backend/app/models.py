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
    start_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    end_date   = db.Column(db.DateTime)
    auto_renew = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

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


class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    email      = db.Column(db.String(255), nullable=False)
    subject    = db.Column(db.String(200), nullable=False)
    message    = db.Column(db.Text, nullable=False)
    is_read    = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'email':      self.email,
            'subject':    self.subject,
            'message':    self.message,
            'is_read':    self.is_read,
            'created_at': self.created_at.isoformat(),
        }


# ─── SUPPORT SYSTEM ──────────────────────────────────────────────────────────

class SupportTicket(db.Model):
    __tablename__ = 'support_tickets'

    id                  = db.Column(db.Integer, primary_key=True)
    ticket_number       = db.Column(db.String(20), unique=True, nullable=False, index=True)
    user_id             = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    guest_name          = db.Column(db.String(120))
    guest_email         = db.Column(db.String(255))
    subject             = db.Column(db.String(200), nullable=False)
    category            = db.Column(db.String(50), default='general')
    priority            = db.Column(db.String(20), default='medium')
    status              = db.Column(db.String(20), default='open', index=True)
    assigned_to_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    first_response_at   = db.Column(db.DateTime)
    resolved_at         = db.Column(db.DateTime)
    satisfaction_rating = db.Column(db.Integer)
    created_at          = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at          = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                                    onupdate=lambda: datetime.now(timezone.utc))

    submitter   = db.relationship('User', foreign_keys=[user_id],
                                  backref='support_tickets', lazy=True)
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id], lazy=True)
    messages    = db.relationship('TicketMessage', backref='ticket', lazy=True,
                                  cascade='all, delete-orphan',
                                  order_by='TicketMessage.created_at')

    @property
    def requester_name(self):
        if self.submitter:
            return self.submitter.full_name or self.submitter.email
        return self.guest_name or 'Guest'

    @property
    def requester_email(self):
        if self.submitter:
            return self.submitter.email
        return self.guest_email

    def to_dict(self, include_messages=False):
        d = {
            'id':                  self.id,
            'ticket_number':       self.ticket_number,
            'subject':             self.subject,
            'category':            self.category,
            'priority':            self.priority,
            'status':              self.status,
            'requester_name':      self.requester_name,
            'requester_email':     self.requester_email,
            'assigned_to_id':      self.assigned_to_id,
            'first_response_at':   self.first_response_at.isoformat() if self.first_response_at else None,
            'resolved_at':         self.resolved_at.isoformat() if self.resolved_at else None,
            'satisfaction_rating': self.satisfaction_rating,
            'created_at':          self.created_at.isoformat(),
            'updated_at':          self.updated_at.isoformat(),
            'message_count':       len(self.messages),
        }
        if include_messages:
            d['messages'] = [m.to_dict() for m in self.messages if not m.is_internal]
        return d


class TicketMessage(db.Model):
    __tablename__ = 'ticket_messages'

    id          = db.Column(db.Integer, primary_key=True)
    ticket_id   = db.Column(db.Integer, db.ForeignKey('support_tickets.id'),
                            nullable=False, index=True)
    sender_type = db.Column(db.String(20), nullable=False)  # user | agent | system
    sender_id   = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    sender_name = db.Column(db.String(120))
    message     = db.Column(db.Text, nullable=False)
    is_internal = db.Column(db.Boolean, default=False)
    created_at  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    sender = db.relationship('User', foreign_keys=[sender_id], lazy=True)

    def to_dict(self):
        return {
            'id':          self.id,
            'ticket_id':   self.ticket_id,
            'sender_type': self.sender_type,
            'sender_name': self.sender_name or (self.sender.full_name if self.sender else 'Support'),
            'message':     self.message,
            'is_internal': self.is_internal,
            'created_at':  self.created_at.isoformat(),
        }


class KnowledgeBaseCategory(db.Model):
    __tablename__ = 'kb_categories'

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(100), nullable=False)
    slug        = db.Column(db.String(100), unique=True, nullable=False)
    icon        = db.Column(db.String(50), default='📚')
    description = db.Column(db.String(300))
    sort_order  = db.Column(db.Integer, default=0)
    created_at  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    articles = db.relationship('KnowledgeBaseArticle', backref='category', lazy=True,
                               cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':            self.id,
            'name':          self.name,
            'slug':          self.slug,
            'icon':          self.icon,
            'description':   self.description,
            'sort_order':    self.sort_order,
            'article_count': len([a for a in self.articles if a.is_published]),
        }


class KnowledgeBaseArticle(db.Model):
    __tablename__ = 'kb_articles'

    id                = db.Column(db.Integer, primary_key=True)
    category_id       = db.Column(db.Integer, db.ForeignKey('kb_categories.id'),
                                  nullable=True, index=True)
    title             = db.Column(db.String(200), nullable=False)
    slug              = db.Column(db.String(200), unique=True, nullable=False)
    content           = db.Column(db.Text, nullable=False)
    excerpt           = db.Column(db.String(400))
    tags              = db.Column(db.Text, default='[]')  # JSON array
    is_published      = db.Column(db.Boolean, default=True)
    is_featured       = db.Column(db.Boolean, default=False)
    helpful_count     = db.Column(db.Integer, default=0)
    not_helpful_count = db.Column(db.Integer, default=0)
    view_count        = db.Column(db.Integer, default=0)
    created_at        = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at        = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                                  onupdate=lambda: datetime.now(timezone.utc))

    def get_tags(self):
        try:
            return json.loads(self.tags) if self.tags else []
        except Exception:
            return []

    def to_dict(self, full=False):
        content = self.content or ''
        d = {
            'id':                self.id,
            'category_id':       self.category_id,
            'title':             self.title,
            'slug':              self.slug,
            'excerpt':           self.excerpt or (content[:200] + '...') if len(content) > 200 else content,
            'tags':              self.get_tags(),
            'is_published':      self.is_published,
            'is_featured':       self.is_featured,
            'helpful_count':     self.helpful_count,
            'not_helpful_count': self.not_helpful_count,
            'view_count':        self.view_count,
            'created_at':        self.created_at.isoformat(),
            'updated_at':        self.updated_at.isoformat(),
        }
        if full:
            d['content'] = self.content
        return d


# ─── COMMUNITY FORUM ─────────────────────────────────────────────────────────

class ForumPost(db.Model):
    __tablename__ = 'forum_posts'

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    author_name  = db.Column(db.String(120), nullable=False)
    author_email = db.Column(db.String(255), nullable=True)
    title        = db.Column(db.String(300), nullable=False)
    body         = db.Column(db.Text, nullable=False)
    category     = db.Column(db.String(50), default='general')
    tags         = db.Column(db.Text, default='[]')
    upvotes      = db.Column(db.Integer, default=0)
    views        = db.Column(db.Integer, default=0)
    is_pinned    = db.Column(db.Boolean, default=False)
    is_answered  = db.Column(db.Boolean, default=False)
    created_at   = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at   = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    author  = db.relationship('User', foreign_keys=[user_id], lazy=True)
    replies = db.relationship('ForumReply', backref='post', lazy=True,
                              cascade='all, delete-orphan',
                              order_by='ForumReply.created_at')

    def get_tags(self):
        try:
            return json.loads(self.tags) if self.tags else []
        except Exception:
            return []

    def to_dict(self, include_replies=False):
        d = {
            'id':           self.id,
            'author_name':  self.author_name,
            'title':        self.title,
            'body':         self.body,
            'category':     self.category,
            'tags':         self.get_tags(),
            'upvotes':      self.upvotes,
            'views':        self.views,
            'is_pinned':    self.is_pinned,
            'is_answered':  self.is_answered,
            'reply_count':  len(self.replies),
            'created_at':   self.created_at.isoformat(),
            'updated_at':   self.updated_at.isoformat(),
        }
        if include_replies:
            d['replies'] = [r.to_dict() for r in self.replies]
        return d


class ForumReply(db.Model):
    __tablename__ = 'forum_replies'

    id          = db.Column(db.Integer, primary_key=True)
    post_id     = db.Column(db.Integer, db.ForeignKey('forum_posts.id'), nullable=False, index=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    author_name = db.Column(db.String(120), nullable=False)
    body        = db.Column(db.Text, nullable=False)
    upvotes     = db.Column(db.Integer, default=0)
    is_accepted = db.Column(db.Boolean, default=False)
    created_at  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id':          self.id,
            'post_id':     self.post_id,
            'author_name': self.author_name,
            'body':        self.body,
            'upvotes':     self.upvotes,
            'is_accepted': self.is_accepted,
            'created_at':  self.created_at.isoformat(),
        }
