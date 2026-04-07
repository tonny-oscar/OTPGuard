import os
from flask import Flask
from dotenv import load_dotenv
from config import config
from app.extensions import db, jwt, mail, cors

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

    # ── Blueprints ────────────────────────────────────────
    from app.auth.routes  import auth_bp
    from app.mfa.routes   import mfa_bp
    from app.users.routes import users_bp
    from app.admin.routes import admin_bp

    app.register_blueprint(auth_bp,  url_prefix='/api/auth')
    app.register_blueprint(mfa_bp,   url_prefix='/api/mfa')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # CORS — init after blueprints so all routes are covered
    cors.init_app(app, resources={
        r'/api/*': {
            'origins': '*',
            'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'allow_headers': ['Content-Type', 'Authorization'],
            'supports_credentials': False,
        }
    })

    # ── Root + Health check ───────────────────────────────
    @app.route('/')
    def root():
        return {'message': 'OTPGuard API is running', 'version': '1.0', 'docs': '/api/health'}, 200

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'env': env, 'message': 'OTPGuard API is running'}, 200

    # ── Create tables ─────────────────────────────────────
    with app.app_context():
        db.create_all()

    return app
