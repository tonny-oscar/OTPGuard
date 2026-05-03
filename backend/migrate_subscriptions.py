"""
Run this once to fix the database schema and backfill subscriptions.
Usage: python migrate_subscriptions.py
"""
from app import create_app

app = create_app()

with app.app_context():
    from app.extensions import db
    from sqlalchemy import text, inspect
    from app.models import User, Subscription, Plan
    from app.subscription.service import SubscriptionService

    # ── Step 1: Add missing columns ──────────────────────────────
    inspector = inspect(db.engine)
    existing_cols = [c['name'] for c in inspector.get_columns('subscriptions')]
    print(f"Existing columns: {existing_cols}")

    migrations = {
        'is_trial':   'ALTER TABLE subscriptions ADD COLUMN is_trial BOOLEAN DEFAULT 0',
        'trial_ends': 'ALTER TABLE subscriptions ADD COLUMN trial_ends DATETIME',
        'end_date':   'ALTER TABLE subscriptions ADD COLUMN end_date DATETIME',
        'auto_renew': 'ALTER TABLE subscriptions ADD COLUMN auto_renew BOOLEAN DEFAULT 1',
    }

    for col, sql in migrations.items():
        if col not in existing_cols:
            try:
                db.session.execute(text(sql))
                db.session.commit()
                print(f"  Added column: {col}")
            except Exception as e:
                print(f"  Column {col} already exists or error: {e}")
                db.session.rollback()

    # ── Step 2: Ensure plans exist ────────────────────────────────
    plan_count = Plan.query.count()
    print(f"\nPlans in DB: {plan_count}")
    if plan_count == 0:
        SubscriptionService.initialize_default_plans()
        print("  Initialized default plans")

    # ── Step 3: Backfill subscriptions for existing users ─────────
    users = User.query.filter_by(role='user').all()
    print(f"\nUsers to check: {len(users)}")
    created = 0
    for u in users:
        existing = Subscription.query.filter(
            Subscription.user_id == u.id,
            Subscription.status.in_(['active', 'trial'])
        ).first()
        if not existing:
            try:
                SubscriptionService.create_subscription(u.id, u.plan or 'starter')
                created += 1
                print(f"  Created subscription for {u.email} ({u.plan})")
            except Exception as e:
                print(f"  Failed for {u.email}: {e}")

    print(f"\nDone!")
    print(f"  Subscriptions created: {created}")
    print(f"  Total subscriptions:   {Subscription.query.count()}")
    print(f"  Total plans:           {Plan.query.count()}")
    print(f"  Total users:           {User.query.count()}")
