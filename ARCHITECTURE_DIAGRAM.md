# OTPGuard Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OTPGuard SaaS Platform                       │
│                    Multi-Tenant Subscription System                  │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Unified Dashboard (React + Vite)                │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │   Sidebar    │  │   TopBar     │  │   Modules    │     │   │
│  │  │  (Dynamic)   │  │              │  │  (Plan-based)│     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │   │
│  │                                                              │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │         Feature Gating Layer (Hooks)               │    │   │
│  │  ├────────────────────────────────────────────────────┤    │   │
│  │  │  • useFeatureGate()                                │    │   │
│  │  │  • useChannelGate()                                │    │   │
│  │  │  • useSubscription()                               │    │   │
│  │  │  • useAnalyticsAccess()                            │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │                                                              │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │         Plan-Specific Modules                      │    │   │
│  │  ├────────────────────────────────────────────────────┤    │   │
│  │  │  Starter:    Basic Dashboard                       │    │   │
│  │  │  Growth:     + Analytics + SMS                     │    │   │
│  │  │  Business:   + Devices + Branding                  │    │   │
│  │  │  Enterprise: + White-label + SLA                   │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                │ HTTP/REST API
                                │ JWT Authentication
                                │
┌───────────────────────────────▼───────────────────────────────────────┐
│                          BACKEND LAYER (Flask)                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    API Endpoints                              │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │  /api/auth/*          - Authentication                        │    │
│  │  /api/mfa/*           - OTP Management                        │    │
│  │  /api/subscription/*  - Subscription Management               │    │
│  │  /api/features/*      - Feature Gating                        │    │
│  │  /api/users/*         - User Management                       │    │
│  │  /api/admin/*         - Admin Operations                      │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              Middleware Layer (Decorators)                    │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │  @require_subscription    - Ensure active subscription        │    │
│  │  @require_feature()       - Check feature access              │    │
│  │  @require_channel()       - Check OTP channel access          │    │
│  │  @check_user_limit        - Validate user count               │    │
│  │  @rate_limit_otp()        - Rate limiting                     │    │
│  │  @log_api_usage()         - Automatic usage tracking          │    │
│  │  @subscription_context    - Add subscription to request       │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                  Business Logic Layer                         │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │                                                               │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │         SubscriptionService                         │    │    │
│  │  ├─────────────────────────────────────────────────────┤    │    │
│  │  │  • check_feature_access()                           │    │    │
│  │  │  • check_otp_channel()                              │    │    │
│  │  │  • check_user_limit()                               │    │    │
│  │  │  • create_subscription()                            │    │    │
│  │  │  • upgrade_subscription()                           │    │    │
│  │  │  • log_usage()                                      │    │    │
│  │  │  • calculate_sms_cost()                             │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  │                                                               │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 │ SQLAlchemy ORM
                                 │
┌────────────────────────────────▼───────────────────────────────────────┐
│                         DATABASE LAYER                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │    Users     │  │    Plans     │  │ Subscriptions│               │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤               │
│  │ id           │  │ id           │  │ id           │               │
│  │ email        │  │ name         │  │ user_id      │               │
│  │ password     │  │ display_name │  │ plan_id      │               │
│  │ role         │  │ price_kes    │  │ status       │               │
│  │ mfa_enabled  │  │ max_users    │  │ start_date   │               │
│  │ created_at   │  │ otp_channels │  │ end_date     │               │
│  └──────────────┘  │ features     │  │ trial_ends   │               │
│                    │ sms_enabled  │  └──────────────┘               │
│                    └──────────────┘                                   │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  UsageLog    │  │ UsageSummary │  │   OTPLog     │               │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤               │
│  │ id           │  │ id           │  │ id           │               │
│  │ user_id      │  │ user_id      │  │ user_id      │               │
│  │ usage_type   │  │ month        │  │ code         │               │
│  │ quantity     │  │ email_count  │  │ method       │               │
│  │ cost_kes     │  │ sms_count    │  │ status       │               │
│  │ timestamp    │  │ total_cost   │  │ timestamp    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Feature Gating Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Feature Access Request                          │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   User Makes Request  │
                    │   (Frontend/API)      │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  JWT Authentication   │
                    │  Validates Token      │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Get User Subscription │
                    │ (Active/Trial/Expired)│
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Get Plan Details    │
                    │   (Features, Limits)  │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Check Feature Access │
                    │  feature in plan?     │
                    └───────────┬───────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌───────────────────┐         ┌───────────────────┐
    │   Access Granted  │         │   Access Denied   │
    │   Execute Request │         │   Return 403      │
    └───────────┬───────┘         └───────────────────┘
                │
                ▼
    ┌───────────────────┐
    │   Log Usage       │
    │   (if applicable) │
    └───────────┬───────┘
                │
                ▼
    ┌───────────────────┐
    │  Return Response  │
    └───────────────────┘
```

## Subscription Plan Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SUBSCRIPTION TIERS                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STARTER (Free)                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  • 50 Users                                                          │
│  • Email OTP Only                                                    │
│  • Basic Dashboard                                                   │
│  • Last 100 Logs                                                     │
│  • Community Support                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ Upgrade (1,500 KES/mo)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  GROWTH (1,500 KES/mo)                                              │
├─────────────────────────────────────────────────────────────────────┤
│  • 1,000 Users                                                       │
│  • Email + SMS OTP                                                   │
│  • Full Dashboard + Analytics                                        │
│  • API Access                                                        │
│  • Usage Tracking                                                    │
│  • Export Logs                                                       │
│  • Priority Email Support                                            │
│  • SMS Cost: 2-5 KES                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ Upgrade (5,000 KES/mo)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BUSINESS (5,000 KES/mo)                                            │
├─────────────────────────────────────────────────────────────────────┤
│  • Unlimited Users                                                   │
│  • Email + SMS + TOTP                                                │
│  • Admin Dashboard                                                   │
│  • Device Tracking                                                   │
│  • Geolocation                                                       │
│  • Custom Branding                                                   │
│  • Advanced Analytics                                                │
│  • Team Management                                                   │
│  • 24/7 Priority Support                                             │
│  • SMS Cost: 1-3 KES                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ Upgrade (Custom)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ENTERPRISE (Custom Pricing)                                         │
├─────────────────────────────────────────────────────────────────────┤
│  • Everything in Business +                                          │
│  • White-Label Mode                                                  │
│  • SLA Monitoring                                                    │
│  • Custom Integrations                                               │
│  • Webhooks & APIs                                                   │
│  • Dedicated Support                                                 │
│  • Audit Logs (Full History)                                         │
│  • On-Prem Deployment                                                │
│  • Dedicated Account Manager                                         │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow: OTP Request with Feature Gating

```
┌──────────┐                                              ┌──────────┐
│  Client  │                                              │ Database │
└────┬─────┘                                              └────┬─────┘
     │                                                          │
     │ 1. POST /api/mfa/send-sms                               │
     │    Authorization: Bearer <token>                        │
     ├──────────────────────────────────────────────────►      │
     │                                                          │
     │                    ┌──────────────────┐                 │
     │                    │  @jwt_required   │                 │
     │                    │  Validate Token  │                 │
     │                    └────────┬─────────┘                 │
     │                             │                           │
     │                    ┌────────▼─────────┐                 │
     │                    │ @require_feature │                 │
     │                    │   ('sms_otp')    │                 │
     │                    └────────┬─────────┘                 │
     │                             │                           │
     │                             │ 2. Get User Subscription  │
     │                             ├──────────────────────────►│
     │                             │                           │
     │                             │ 3. Return Subscription    │
     │                             │◄──────────────────────────┤
     │                             │                           │
     │                    ┌────────▼─────────┐                 │
     │                    │  Check if 'sms'  │                 │
     │                    │  in plan.channels│                 │
     │                    └────────┬─────────┘                 │
     │                             │                           │
     │                    ┌────────▼─────────┐                 │
     │                    │  Access Granted? │                 │
     │                    └────────┬─────────┘                 │
     │                             │                           │
     │                    YES      │      NO                   │
     │              ┌──────────────┴──────────────┐            │
     │              │                             │            │
     │     ┌────────▼─────────┐      ┌───────────▼────────┐   │
     │     │  Send SMS OTP    │      │  Return 403        │   │
     │     │  via Twilio      │      │  Feature Locked    │   │
     │     └────────┬─────────┘      └───────────┬────────┘   │
     │              │                            │            │
     │              │ 4. Log Usage               │            │
     │              ├───────────────────────────►│            │
     │              │    (sms_otp, cost)         │            │
     │              │                            │            │
     │ 5. Success   │                            │ 5. Error   │
     │◄─────────────┤                            │◄───────────┤
     │              │                            │            │
     │              │                            │            │
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend Components                          │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────┐
    │              UnifiedDashboard.jsx                     │
    │  ┌────────────────────────────────────────────────┐  │
    │  │  useSubscription() → currentPlan, features     │  │
    │  └────────────────────────────────────────────────┘  │
    │                        │                              │
    │         ┌──────────────┼──────────────┐              │
    │         │              │              │              │
    │    ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐        │
    │    │ Sidebar │   │  TopBar   │  │ Modules │        │
    │    └────┬────┘   └───────────┘  └────┬────┘        │
    │         │                             │              │
    │         │ useFeatureGate()            │              │
    │         │ hasAccess?                  │              │
    │         │                             │              │
    │    ┌────▼────────────────────────┐    │              │
    │    │  Show/Lock Menu Items       │    │              │
    │    │  • Overview (all)           │    │              │
    │    │  • Analytics (Growth+)      │    │              │
    │    │  • Devices (Business+)      │    │              │
    │    │  • Branding (Business+)     │    │              │
    │    │  • Integrations (Enterprise)│    │              │
    │    └─────────────────────────────┘    │              │
    │                                       │              │
    │                          ┌────────────▼────────────┐ │
    │                          │  Render Module          │ │
    │                          │  Based on Plan          │ │
    │                          │                         │ │
    │                          │  if (locked) {          │ │
    │                          │    <UpgradePrompt />    │ │
    │                          │  } else {               │ │
    │                          │    <FeatureContent />   │ │
    │                          │  }                      │ │
    │                          └─────────────────────────┘ │
    └──────────────────────────────────────────────────────┘
```

---

**Legend:**
- `┌─┐` = Component/Module
- `│` = Connection/Flow
- `▼` = Data Flow Direction
- `►` = API Request
- `◄` = API Response

