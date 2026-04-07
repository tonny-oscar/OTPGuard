import sys
import bcrypt

sys.path.insert(0, '.')
from app import create_app
from app.extensions import db
from app.models import User

app = create_app()

with app.app_context():
    db.create_all()

    # Remove any existing admin
    existing = User.query.filter_by(email='admin@otpguard.co.ke').first()
    if existing:
        db.session.delete(existing)
        db.session.commit()

    # Create fresh admin with known password
    pw = bcrypt.hashpw(b'Admin1234', bcrypt.gensalt()).decode()
    admin = User(
        email='admin@otpguard.co.ke',
        password_hash=pw,
        full_name='OTPGuard Admin',
        phone='+254794886149',
        role='admin',
        plan='business',
        mfa_enabled=False,
        is_active=True
    )
    db.session.add(admin)
    db.session.commit()

    # Verify
    u = User.query.filter_by(email='admin@otpguard.co.ke').first()
    check = bcrypt.checkpw(b'Admin1234!', u.password_hash.encode())

    with open('reset_result.txt', 'w') as f:
        f.write(f"Email: {u.email}\n")
        f.write(f"Role: {u.role}\n")
        f.write(f"Active: {u.is_active}\n")
        f.write(f"MFA: {u.mfa_enabled}\n")
        f.write(f"Password check: {check}\n")
        f.write(f"Total users: {User.query.count()}\n")
        f.write("SUCCESS\n")
