# OTPGuard - Multi-Tenant SaaS Dashboard Implementation Guide

## 🎯 Architecture Overview

OTPGuard is a **unified, single-codebase dashboard** with dynamic feature gating based on subscription plans. All users access the same application, but features are enabled/disabled based on their plan tier.

## 📋 Subscription Plans

### 1. **Starter Plan (Free)**
- **Max Users**: 50
- **OTP Channels**: Email only
- **Features**:
  - Basic dashboard overview
  - Email OTP sending
  - Limited logs (last 100 events)
  - Simple statistics
- **Locked Features**: SMS, TOTP, Analytics, Device Tracking, Branding

### 2. **Growth Plan (1,500 KES/mo)**
- **Max Users**: 1,000
- **OTP Channels**: Email + SMS
- **Features**:
  - Full dashboard with charts
  - Email + SMS OTP
  - Usage analytics
  - API access
  - Export logs (CSV)
  - SMS cost tracking (2-5 KES per SMS)
- **Locked Features**: TOTP, Device Tracking, Custom Branding

### 3. **Business Plan (5,000 KES/mo)**
- **Max Users**: Unlimited
- **OTP Channels**: Email + SMS + TOTP
- **Features**:
  - Everything in Growth PLUS:
  - Admin dashboard
  - Team management
  - Device tracking & fingerprinting
  - Geolocation tracking
  - Custom branding (logo, messages)
  - Advanced analytics
  - SMS cost: 1-3 KES
- **Locked Features**: White-label, SLA Monitoring

### 4. **Enterprise Plan (Custom Pricing)**
- **Max Users**: Unlimited
- **OTP Channels**: Email + SMS + TOTP
- **Features**:
  - Everything in Business PLUS:
  - White-label mode
  - SLA monitoring dashboard
  - Custom integrations (webhooks, APIs)
  - Dedicated support
  - Audit logs (full history)
  - On-prem deployment options

---

## 🏗️ Technical Implementation

### Backend Architecture

#### 1. **Database Models** (`backend/app/models.py`)

```python
# Core subscription models
- Plan: Stores plan configurations
- Subscription: User's active subscription
- UsageLog: Tracks API usage for billing
- UsageSummary: Monthly aggregated usage
```

#### 2. **Feature Gating Middleware** (`backend/app/subscription/middleware.py`)

```python
@require_subscription  # Ensures active subscription
@require_feature('feature_name')  # Checks feature access
@require_channel('sms')  # Checks OTP channel access
@check_user_limit  # Validates user count limits
```

#### 3. **Subscription Service** (`backend/app/subscription/service.py`)

```python
SubscriptionService.check_feature_access(user_id, feature)
SubscriptionService.check_otp_channel(user_id, channel)
SubscriptionService.check_user_limit(user_id)
SubscriptionService.log_usage(user_id, usage_type, cost)
```

#### 4. **API Endpoints**

```
GET  /api/subscription/plans          # List all plans
GET  /api/subscription/current        # Get user's subscription
POST /api/subscription/subscribe      # Subscribe to plan
POST /api/subscription/upgrade        # Upgrade plan
GET  /api/subscription/usage          # Get usage stats
GET  /api/features/check              # Check all feature access
GET  /api/features/matrix             # Get feature matrix
```

### Frontend Architecture

#### 1. **Unified Dashboard** (`src/components/dashboard/UnifiedDashboard.jsx`)

Single dashboard component that renders different modules based on plan:

```jsx
<UnifiedDashboard module="overview" />
<UnifiedDashboard module="analytics" />
<UnifiedDashboard module="devices" />
```

#### 2. **Dynamic Sidebar** (`src/components/dashboard/Sidebar.jsx`)

Navigation items are:
- **Visible but locked** for unavailable features
- Show "Upgrade to [Plan]" prompts
- Dynamically filtered based on current plan

#### 3. **Feature Gating Hooks**

```jsx
// Check feature access
const { hasAccess, isLocked, upgradeInfo } = useFeatureGate('sms_otp');

// Check channel access
const { hasAccess } = useChannelGate('sms');

// Get analytics level
const { hasBasicAnalytics, hasAdvancedAnalytics } = useAnalyticsAccess();
```

#### 4. **Plan-Based Modules**

```
src/components/dashboard/modules/
├── OverviewModule.jsx      # Adapts to all plans
├── AnalyticsModule.jsx     # Growth+
├── DevicesModule.jsx       # Business+
├── BrandingModule.jsx      # Business+
├── IntegrationsModule.jsx  # Enterprise
└── AuditLogsModule.jsx     # Enterprise
```

Each module checks access and shows upgrade prompt if locked.

---

## 🔐 Feature Gating Logic

### Backend Example

```python
from app.subscription.middleware import require_feature

@mfa_bp.route('/send-sms', methods=['POST'])
@require_feature('sms_otp')
def send_sms_otp():
    # Only accessible if user's plan includes 'sms_otp'
    pass
```

### Frontend Example

```jsx
import { useFeatureGate } from '../hooks/useFeatureFlag';

function SMSOTPButton() {
  const { hasAccess, upgradeInfo } = useFeatureGate('sms_otp');
  
  if (!hasAccess) {
    return (
      <button disabled className="opacity-50">
        SMS OTP (Upgrade to {upgradeInfo.plan})
      </button>
    );
  }
  
  return <button onClick={sendSMS}>Send SMS OTP</button>;
}
```

---

## 🎨 UI/UX Patterns

### 1. **Locked Features**
- Visible but greyed out
- Lock icon displayed
- Tooltip: "Upgrade to [Plan] to unlock"
- Click shows upgrade modal

### 2. **Upgrade Banners**
```jsx
<UpgradeBanner
  title="Unlock Advanced Analytics"
  description="Get detailed charts and export capabilities"
  targetPlan="Growth"
  price="1,500 KES/mo"
/>
```

### 3. **Plan Badge**
```jsx
<PlanBadge />
// Shows: "Current Plan: Growth" with upgrade button
```

---

## 📊 Usage Tracking & Billing

### Automatic Usage Logging

```python
@log_api_usage('sms_otp')
def send_sms():
    # Automatically logs usage after successful execution
    pass
```

### Usage Types
- `email_otp`: Email OTP sent
- `sms_otp`: SMS OTP sent (with cost)
- `totp_verify`: TOTP verification
- `user_added`: New user added

### Monthly Summaries
```python
GET /api/subscription/usage?month=2024-01
{
  "email_otp_count": 150,
  "sms_otp_count": 45,
  "total_cost_kes": 135.00
}
```

---

## 🚀 Deployment Checklist

### Backend Setup

1. **Initialize Database**
```bash
cd backend
python -c "from app import create_app; from app.extensions import db; app = create_app(); app.app_context().push(); db.create_all()"
```

2. **Seed Plans**
```bash
python init_subscriptions.py
```

3. **Run Server**
```bash
python run.py
```

### Frontend Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure API URL**
```javascript
// src/context/api.js
const API_URL = 'http://localhost:5000/api';
```

3. **Run Development Server**
```bash
npm run dev
```

---

## 🧪 Testing Feature Gates

### Test Starter Plan
```bash
# Register user (auto-assigned Starter)
POST /api/auth/register

# Try accessing SMS endpoint (should fail)
POST /api/mfa/send-sms
# Response: 403 {"error": "Feature not available in your plan"}
```

### Test Upgrade Flow
```bash
# Upgrade to Growth
POST /api/subscription/upgrade
{"plan_name": "growth"}

# Now SMS works
POST /api/mfa/send-sms
# Response: 200 OK
```

---

## 📈 Scaling Considerations

### Multi-Tenancy
- Each user belongs to a tenant (organization)
- Tenant has subscription
- All users in tenant share plan limits

### Performance
- Cache plan features in Redis
- Index subscription queries
- Lazy-load dashboard modules

### Security
- JWT-based authentication
- API key authentication for external integrations
- Rate limiting per plan tier

---

## 🔧 Customization Guide

### Adding New Feature

1. **Add to Plan Model**
```python
# In init_subscriptions.py
'features': ['existing_features', 'new_feature']
```

2. **Add to Frontend Permissions**
```javascript
// src/utils/planPermissions.js
export const PLAN_FEATURES = {
  growth: {
    features: ['...', 'new_feature']
  }
}
```

3. **Protect Backend Route**
```python
@require_feature('new_feature')
def new_endpoint():
    pass
```

4. **Gate Frontend Component**
```jsx
const { hasAccess } = useFeatureGate('new_feature');
```

---

## 📞 Support & Documentation

- **API Docs**: http://localhost:5000/apidocs
- **Feature Matrix**: GET /api/features/matrix
- **Health Check**: GET /api/health

---

## ✅ Production Checklist

- [ ] Set strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Configure production database (PostgreSQL)
- [ ] Set up email service (SMTP/SendGrid)
- [ ] Configure SMS provider (Twilio/Africa's Talking)
- [ ] Enable HTTPS
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Load test subscription endpoints
- [ ] Test upgrade/downgrade flows
- [ ] Verify billing calculations
- [ ] Test feature gates for all plans

---

**Built with ❤️ for scalable SaaS applications**
