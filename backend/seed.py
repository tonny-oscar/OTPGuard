"""
Run once to create the admin account:
  venv\Scripts\python seed.py
"""
import bcrypt
from app import create_app
from app.extensions import db
from app.models import User

app = create_app('development')

with app.app_context():
    db.create_all()

    existing = User.query.filter_by(email='admin@otpguard.co.ke').first()
    if existing:
        print('Admin already exists — skipping.')
    else:
        pw_hash = bcrypt.hashpw(b'admin1234', bcrypt.gensalt()).decode()
        admin = User(
            email='admin@otpguard.co.ke',
            password_hash=pw_hash,
            full_name='OTPGuard Admin',
            phone='+254700000000',
            role='admin',
            plan='business',
            mfa_enabled=False,
            is_active=True,
        )
        db.session.add(admin)
        db.session.commit()
        print('Admin created successfully.')
        print('  Email:    admin@otpguard.co.ke')
        print('  Password: admin1234')
        print('  Role:     admin')
        print()
        print('Change the password after first login!')
