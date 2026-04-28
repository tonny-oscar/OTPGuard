import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from config import config
from app.extensions import db, jwt, mail
from flask_cors import CORS
from flasgger import Swagger

BASE_DIR    = os.path.abspath(os.path.dirname(__file__))
DOTENV_PATH = os.path.join(BASE_DIR, '..', '.env')
load_dotenv(DOTENV_PATH)


def create_app(env=None):
    app = Flask(__name__)

    env = env or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config.get(env, config['default']))

    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # ── CORS: wildcard for dev, no credentials needed ──────────────
    CORS(app,
         resources={r'/api/*': {'origins': '*'}},
         supports_credentials=False,
         allow_headers=['Content-Type', 'Authorization', 'X-API-Key'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
         max_age=600)

    # ── Guarantee CORS headers on EVERY response (incl. 4xx/5xx) ──
    @app.after_request
    def _add_cors(response):
        response.headers['Access-Control-Allow-Origin']  = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-API-Key'
        return response

    # ── Handle OPTIONS preflight BEFORE any JWT/auth checks ────────
    @app.before_request
    def _handle_preflight():
        if request.method == 'OPTIONS':
            resp = jsonify({'ok': True})
            resp.headers['Access-Control-Allow-Origin']  = '*'
            resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
            resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-API-Key'
            resp.headers['Access-Control-Max-Age']       = '600'
            return resp, 200

    Swagger(app, template={
        "swagger": "2.0",
        "info": {
            "title": "OTPGuard API",
            "description": "Multi-factor authentication OTP service API",
            "version": "1.0.0",
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
            }
        }
    })

    from app.auth.routes         import auth_bp
    from app.mfa.routes          import mfa_bp
    from app.users.routes        import users_bp
    from app.admin.routes        import admin_bp
    from app.subscription.routes import subscription_bp

    app.register_blueprint(auth_bp,         url_prefix='/api/auth')
    app.register_blueprint(mfa_bp,          url_prefix='/api/mfa')
    app.register_blueprint(users_bp,        url_prefix='/api/users')
    app.register_blueprint(admin_bp,        url_prefix='/api/admin')
    app.register_blueprint(subscription_bp, url_prefix='/api/subscription')

    @app.route('/')
    def index():
        return {'message': 'OTPGuard API is running', 'version': '1.0.0', 'docs': '/apidocs'}, 200

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'env': env}, 200

    with app.app_context():
        db.create_all()
        from app.subscription.service import SubscriptionService
        SubscriptionService.initialize_default_plans()

    return app
