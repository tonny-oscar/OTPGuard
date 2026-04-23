import os
from flask import Flask, request
from dotenv import load_dotenv
from config import config
from app.extensions import db, jwt, mail, cors
from flasgger import Swagger

# Load backend/.env explicitly so env vars work even when the app is launched
# from the repository root or another working directory.
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DOTENV_PATH = os.path.join(BASE_DIR, '..', '.env')
load_dotenv(DOTENV_PATH)


def create_app(env=None):
    app = Flask(__name__)

    env = env or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config.get(env, config['default']))

    # ── Extensions ────────────────────────────────────────
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # ── CORS — init BEFORE blueprints so it applies to all routes
    cors.init_app(app, resources={
        r'/api/*': {
            'origins': ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', '*'],
            'methods': ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            'allow_headers': ['Content-Type', 'Authorization', 'X-API-Key'],
            'expose_headers': ['Content-Type', 'Authorization'],
            'supports_credentials': True,
            'max_age': 3600,
        }
    })

    # ── Swagger Documentation ─────────────────────────────
    swagger = Swagger(app, template={
        "swagger": "2.0",
        "info": {
            "title": "OTPGuard API",
            "description": "Multi-factor authentication OTP service API",
            "version": "1.0.0",
            "contact": {
                "name": "OTPGuard Support",
                "url": "https://otpguard.local"
            }
        },
        "host": "localhost:5000",
        "basePath": "/api",
        "schemes": ["http", "https"],
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT Bearer token in the header with ** Bearer ** prefix."
            }
        }
    })

    # ── Blueprints ────────────────────────────────────────
    from app.auth.routes  import auth_bp
    from app.mfa.routes   import mfa_bp
    from app.users.routes import users_bp
    from app.admin.routes import admin_bp
    from app.subscription.routes import subscription_bp

    app.register_blueprint(auth_bp,  url_prefix='/api/auth')
    app.register_blueprint(mfa_bp,   url_prefix='/api/mfa')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(subscription_bp, url_prefix='/api/subscription')

    # ── Root route ────────────────────────────────────────
    @app.route('/')
    def index():
        return {
            'message': 'OTPGuard API is running',
            'version': '1.0.0',
            'docs': '/apidocs',
            'health': '/api/health'
        }, 200

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'env': env, 'message': 'OTPGuard API is running'}, 200

    return app

    # ── Create tables ─────────────────────────────────────
    with app.app_context():
        db.create_all()

        # Initialize default subscription plans
        from app.subscription.service import SubscriptionService
        SubscriptionService.initialize_default_plans()
