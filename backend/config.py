import os
from datetime import timedelta

class Config:
    # ── Core ──────────────────────────────────────────────
    SECRET_KEY  = os.getenv('SECRET_KEY', 'otpguard-secret-key-change-in-prod')
    DEBUG       = False
    TESTING     = False

    # ── Database ──────────────────────────────────────────
    SQLALCHEMY_DATABASE_URI     = os.getenv('DATABASE_URL', 'sqlite:///otpguard.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── JWT ───────────────────────────────────────────────
    JWT_SECRET_KEY            = os.getenv('JWT_SECRET_KEY', 'otpguard-jwt-secret-change-in-prod')
    JWT_ACCESS_TOKEN_EXPIRES  = timedelta(hours=2)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # ── Email (SMTP) ──────────────────────────────────────
    MAIL_SERVER         = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT           = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS        = True
    MAIL_USE_SSL        = False
    MAIL_USERNAME       = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD       = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@otpguard.co.ke')

    # ── Twilio SMS ────────────────────────────────────────
    TWILIO_ACCOUNT_SID  = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN   = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

    # ── Africa's Talking SMS ──────────────────────────────
    AT_API_KEY  = os.getenv('AT_API_KEY')
    AT_USERNAME = os.getenv('AT_USERNAME', 'sandbox')

    # ── OTP ───────────────────────────────────────────────
    OTP_EXPIRY_SECONDS = int(os.getenv('OTP_EXPIRY_SECONDS', 300))
    OTP_LENGTH         = 6

    # ── CORS ──────────────────────────────────────────────
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
    'default':     DevelopmentConfig,
}
