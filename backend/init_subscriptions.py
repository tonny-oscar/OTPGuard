#!/usr/bin/env python3
"""
Subscription Migration Script
=============================

This script initializes subscriptions for existing users and sets up default plans.
Run this after implementing the subscription system to migrate existing users.

Usage:
    python init_subscriptions.py
"""

import os
import sys
from datetime import datetime, timezone, timedelta

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models import User, Plan, Subscription
from app.subscription.service import SubscriptionService

def init_subscriptions():
    """Initialize subscriptions for existing users"""
    app = create_app()
    
    with app.app_context():
        print("🚀 Initializing OTPGuard Subscription System...")
        
        # 1. Initialize default plans
        print("\n📋 Setting up default plans...")
        SubscriptionService.initialize_default_plans()
        
        # Display created plans
        plans = Plan.query.all()
        print(f"✅ Created {len(plans)} plans:")
        for plan in plans:
            print(f"   • {plan.display_name} - {plan.price_kes/100:.0f} KES")
        
        # 2. Migrate existing users to subscriptions
        print("\n👥 Migrating existing users...")
        users = User.query.all()
        starter_plan = Plan.query.filter_by(name='starter').first()
        
        migrated_count = 0
        for user in users:
            # Check if user already has a subscription
            existing_sub = Subscription.query.filter_by(user_id=user.id).first()
            if existing_sub:
                continue
            
            # Create subscription based on user's current plan
            plan_name = user.plan if user.plan in ['starter', 'growth', 'business', 'enterprise'] else 'starter'
            plan = Plan.query.filter_by(name=plan_name).first()
            
            if not plan:
                plan = starter_plan
            
            # Create subscription
            subscription = Subscription(
                user_id=user.id,
                plan_id=plan.id,
                status='active',
                start_date=user.created_at or datetime.now(timezone.utc)
            )
            
            # Give existing users a 14-day trial of Growth plan if they're on starter
            if plan_name == 'starter' and user.created_at:
                growth_plan = Plan.query.filter_by(name='growth').first()
                if growth_plan:
                    subscription.plan_id = growth_plan.id
                    subscription.status = 'trial'
                    subscription.trial_ends = datetime.now(timezone.utc) + timedelta(days=14)
                    print(f"   • {user.email} -> Growth (14-day trial)")
                else:
                    print(f"   • {user.email} -> Starter")
            else:
                print(f"   • {user.email} -> {plan.display_name}")
            
            db.session.add(subscription)
            migrated_count += 1
        
        db.session.commit()
        print(f"✅ Migrated {migrated_count} users to subscription system")
        
        # 3. Display summary
        print("\n📊 Subscription Summary:")
        for plan in plans:
            count = Subscription.query.filter_by(plan_id=plan.id, status='active').count()
            trial_count = Subscription.query.filter_by(plan_id=plan.id, status='trial').count()
            if count > 0 or trial_count > 0:
                status_text = f"{count} active"
                if trial_count > 0:
                    status_text += f", {trial_count} trial"
                print(f"   • {plan.display_name}: {status_text}")
        
        print("\n🎉 Subscription system initialized successfully!")
        print("\n📡 New API Endpoints Available:")
        print("   • GET  /api/subscription/plans")
        print("   • GET  /api/subscription/current")
        print("   • POST /api/subscription/subscribe")
        print("   • POST /api/subscription/upgrade")
        print("   • POST /api/subscription/trial")
        print("   • GET  /api/subscription/usage")
        print("   • GET  /api/subscription/check/feature/<name>")
        print("   • GET  /api/subscription/check/channel/<type>")

if __name__ == '__main__':
    init_subscriptions()