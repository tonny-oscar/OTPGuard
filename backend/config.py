import os
from datetime import timedelta


def _fix_db_url(url: str) -> str:
    """
    Heroku / some providers return 'postgres://' but SQLAlchemy 2.x
    requires 'postgresql://'. Fix it transparently.
    """
    if url and url.startswith('postgres://'):
        return url.replace('postgres://', 'postgresql://', 1)
    return url


class Config:
    # ── Core ──────────────────────────────────────────────────────
    SECRET_KEY = os.getenv('SECRET_KEY', 'otpguard-secret-key-change-in-prod')
    DEBUG      = False
    TESTING    = False

    # ── Database ──────────────────────────────────────────────────
    SQLALCHEMY_DATABASE_URI        = _fix_db_url(
        os.getenv('DATABASE_URL', 'sqlite:///otpguard.db')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Connection pool settings for PostgreSQL
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,       # Detect stale connections
        'pool_recycle':  300,        # Recycle connections every 5 min
        'pool_size':     10,
        'max_overflow':  20,
    }

    # ── JWT ───────────────────────────────────────────────────────
    JWT_SECRET_KEY            = os.getenv('JWT_SECRET_KEY', 'otpguard-jwt-secret-change-in-prod')
    JWT_ACCESS_TOKEN_EXPIRES  = timedelta(hours=2)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # ── Email (SMTP) ──────────────────────────────────────────────
    MAIL_SERVER         = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT           = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS        = os.getenv('MAIL_USE_TLS', 'True').lower() in ('true', '1')
    MAIL_USE_SSL        = False
    MAIL_USERNAME       = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD       = (os.getenv('MAIL_PASSWORD') or '').replace(' ', '')  # strip spaces from App Password
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@otpguard.co.ke')
    MAIL_SUPPRESS_SEND  = False

    # ── Twilio SMS ────────────────────────────────────────────────
    TWILIO_ACCOUNT_SID  = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN   = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

    # ── Africa's Talking SMS ──────────────────────────────────────
    AT_API_KEY  = os.getenv('AT_API_KEY')
    AT_USERNAME = os.getenv('AT_USERNAME', 'sandbox')

    # ── OTP ───────────────────────────────────────────────────────
    OTP_EXPIRY_SECONDS = int(os.getenv('OTP_EXPIRY_SECONDS', 300))
    OTP_LENGTH         = 6

    # ── CORS ──────────────────────────────────────────────────────
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    # ── Monitoring & Alerting ─────────────────────────────────────
    SLACK_WEBHOOK_URL          = os.getenv('SLACK_WEBHOOK_URL')
    DISCORD_WEBHOOK_URL        = os.getenv('DISCORD_WEBHOOK_URL')
    PAGERDUTY_INTEGRATION_KEY  = os.getenv('PAGERDUTY_INTEGRATION_KEY')


class DevelopmentConfig(Config):
    DEBUG = True
    # SQLite pool settings don't apply — override to avoid warnings
    SQLALCHEMY_ENGINE_OPTIONS = {'pool_pre_ping': True}


class ProductionConfig(Config):
    DEBUG = False
    # Enforce strong secrets in production
    @classmethod
    def init_app(cls, app):
        Config.init_app(app) if hasattr(Config, 'init_app') else None
        assert os.getenv('SECRET_KEY'), 'SECRET_KEY must be set in production'
        assert os.getenv('JWT_SECRET_KEY'), 'JWT_SECRET_KEY must be set in production'


class TestingConfig(Config):
    TESTING                 = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_ENGINE_OPTIONS = {}
    MAIL_SUPPRESS_SEND      = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)


config = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
    'testing':     TestingConfig,
    'default':     DevelopmentConfig,
}
