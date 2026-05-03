#!/bin/sh
# entrypoint.sh — runs before gunicorn/flask starts
set -e

echo "[entrypoint] Starting OTPGuard backend..."

# ── Wait for PostgreSQL if DATABASE_URL points to postgres ────────
if echo "$DATABASE_URL" | grep -q "postgresql"; then
    echo "[entrypoint] Waiting for PostgreSQL..."
    # Extract host and port from DATABASE_URL
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
    DB_PORT=${DB_PORT:-5432}

    until python -c "
import socket, sys
try:
    s = socket.create_connection(('$DB_HOST', $DB_PORT), timeout=2)
    s.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
        echo "[entrypoint] PostgreSQL not ready — retrying in 2s..."
        sleep 2
    done
    echo "[entrypoint] PostgreSQL is ready."
fi

# ── Run DB migrations ─────────────────────────────────────────────
echo "[entrypoint] Running database setup..."
python -c "
from app import create_app
import os
app = create_app(os.getenv('FLASK_ENV', 'production'))
with app.app_context():
    from app.extensions import db
    from sqlalchemy import text, inspect

    # Create all tables
    db.create_all()
    print('[entrypoint] Tables created/verified.')

    # Add missing columns (idempotent)
    inspector = inspect(db.engine)
    if 'subscriptions' in inspector.get_table_names():
        cols = [c['name'] for c in inspector.get_columns('subscriptions')]
        migrations = {
            'is_trial':   'ALTER TABLE subscriptions ADD COLUMN is_trial BOOLEAN DEFAULT 0',
            'trial_ends': 'ALTER TABLE subscriptions ADD COLUMN trial_ends DATETIME',
            'end_date':   'ALTER TABLE subscriptions ADD COLUMN end_date DATETIME',
            'auto_renew': 'ALTER TABLE subscriptions ADD COLUMN auto_renew BOOLEAN DEFAULT 1',
        }
        for col, sql in migrations.items():
            if col not in cols:
                try:
                    db.session.execute(text(sql))
                    db.session.commit()
                    print(f'[entrypoint] Added column: {col}')
                except Exception as e:
                    db.session.rollback()

    # Seed default plans
    from app.subscription.service import SubscriptionService
    SubscriptionService.initialize_default_plans()
    print('[entrypoint] Plans seeded.')

    # Backfill subscriptions for existing users
    from app.models import User, Subscription
    for u in User.query.filter_by(role='user').all():
        existing = Subscription.query.filter(
            Subscription.user_id == u.id,
            Subscription.status.in_(['active', 'trial'])
        ).first()
        if not existing:
            try:
                SubscriptionService.create_subscription(u.id, u.plan or 'starter')
            except Exception:
                pass
    print('[entrypoint] Subscriptions backfilled.')
"

echo "[entrypoint] Setup complete. Starting server..."

# ── Start the application ─────────────────────────────────────────
exec "$@"
