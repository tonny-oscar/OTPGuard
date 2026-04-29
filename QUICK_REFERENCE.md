# OTPGuard Quick Reference Card

## 🚀 Quick Start

```bash
./setup.sh                    # Automated setup
cd backend && python run.py   # Start backend (port 5000)
npm run dev                   # Start frontend (port 5173)
```

## 📋 Subscription Plans at a Glance

| Plan | Price | Users | Channels | Key Features |
|------|-------|-------|----------|--------------|
| **Starter** | Free | 50 | Email | Basic dashboard, 100 logs |
| **Growth** | 1,500 KES | 1,000 | Email, SMS | Analytics, API, exports |
| **Business** | 5,000 KES | ∞ | Email, SMS, TOTP | Devices, branding, admin |
| **Enterprise** | Custom | ∞ | All | White-label, SLA, webhooks |

## 🔐 Backend: Protect Endpoints

```python
# Require active subscription
@require_subscription
def my_endpoint():
    pass

# Require specific feature
@require_feature('sms_otp')
def send_sms():
    pass

# Require OTP channel
@require_channel('sms')
def sms_endpoint():
    pass

# Check user limit
@check_user_limit
def add_user():
    pass

# Log usage automatically
@log_api_usage('sms_otp')
def send_sms():
    pass
```

## 🎨 Frontend: Gate Features

```jsx
// Hook-based gating
import { useFeatureGate } from '../hooks/useFeatureFlag';

function MyComponent() {
  const { hasAccess, upgradeInfo } = useFeatureGate('sms_otp');
  
  if (!hasAccess) {
    return <UpgradePrompt upgradeInfo={upgradeInfo} />;
  }
  
  return <FeatureContent />;
}

// Component-based gating
import FeatureGate from '../components/shared/FeatureGate';

<FeatureGate feature="device_tracking">
  <DeviceList />
</FeatureGate>

// Check channel access
import { useChannelGate } from '../hooks/useFeatureFlag';

const { hasAccess } = useChannelGate('sms');
```

## 🔑 Key API Endpoints

### Subscription Management
```
GET  /api/subscription/plans           # List all plans
GET  /api/subscription/current         # Get user's subscription
POST /api/subscription/subscribe       # Subscribe to plan
POST /api/subscription/upgrade         # Upgrade plan
GET  /api/subscription/usage           # Get usage stats
```

### Feature Gating
```
GET /api/features/check                      # Check all features
GET /api/features/matrix                     # Get feature matrix
GET /api/subscription/check/feature/:name    # Check specific feature
GET /api/subscription/check/channel/:type    # Check OTP channel
GET /api/subscription/check/limits           # Check usage limits
```

### OTP Operations
```
POST /api/mfa/send-email       # Send email OTP
POST /api/mfa/send-sms         # Send SMS OTP (Growth+)
POST /api/mfa/verify           # Verify OTP
POST /api/mfa/setup-totp       # Setup TOTP (Business+)
```

## 📊 Feature Matrix

```javascript
// Frontend: src/utils/planPermissions.js
import { hasFeature, canUseChannel } from '../utils/planPermissions';

hasFeature('growth', 'sms_otp')           // true
canUseChannel('starter', 'sms')           // false
getMaxUsers('business')                   // -1 (unlimited)
```

```python
# Backend: app/subscription/service.py
from app.subscription.service import SubscriptionService

allowed, msg = SubscriptionService.check_feature_access(user_id, 'device_tracking')
allowed, msg = SubscriptionService.check_otp_channel(user_id, 'sms')
allowed, msg = SubscriptionService.check_user_limit(user_id)
```

## 🎯 Common Patterns

### Pattern 1: Protected API Endpoint
```python
@mfa_bp.route('/send-sms', methods=['POST'])
@require_subscription
@require_channel('sms')
@rate_limit_otp(max_requests=5, window_minutes=5)
@log_api_usage('sms_otp')
def send_sms_otp():
    data = request.get_json()
    # Send SMS logic
    return jsonify({'success': True}), 200
```

### Pattern 2: Conditional Frontend Feature
```jsx
function SMSSection() {
  const { hasAccess, upgradeInfo } = useFeatureGate('sms_otp');
  
  return (
    <div className="feature-section">
      <h3>SMS OTP</h3>
      {hasAccess ? (
        <SMSForm />
      ) : (
        <div className="locked">
          <LockIcon />
          <p>Upgrade to {upgradeInfo.plan} to unlock SMS</p>
          <UpgradeButton plan={upgradeInfo.plan} />
        </div>
      )}
    </div>
  );
}
```

### Pattern 3: Dynamic Dashboard Module
```jsx
function OverviewModule() {
  const { currentPlan } = useSubscription();
  
  switch (currentPlan) {
    case 'starter':
      return <StarterView />;
    case 'growth':
      return <GrowthView />;
    case 'business':
      return <BusinessView />;
    case 'enterprise':
      return <EnterpriseView />;
  }
}
```

## 🧪 Testing Checklist

```bash
# 1. Register user (gets Starter plan)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# 3. Check current plan
curl -X GET http://localhost:5000/api/subscription/current \
  -H "Authorization: Bearer <token>"

# 4. Try SMS (should fail on Starter)
curl -X POST http://localhost:5000/api/mfa/send-sms \
  -H "Authorization: Bearer <token>" \
  -d '{"phone":"+254712345678"}'

# 5. Upgrade to Growth
curl -X POST http://localhost:5000/api/subscription/upgrade \
  -H "Authorization: Bearer <token>" \
  -d '{"plan_name":"growth"}'

# 6. Try SMS again (should succeed)
curl -X POST http://localhost:5000/api/mfa/send-sms \
  -H "Authorization: Bearer <token>" \
  -d '{"phone":"+254712345678"}'
```

## 📦 Database Models

```python
# Core models
User          # Users with authentication
Plan          # Subscription plans
Subscription  # User subscriptions
UsageLog      # API usage tracking
UsageSummary  # Monthly aggregates
OTPLog        # OTP request logs
Device        # Device tracking
APIKey        # API keys for integrations
```

## 🔧 Configuration

### Backend (.env)
```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///otpguard.db

MAIL_SERVER=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend (api.js)
```javascript
const API_URL = 'http://localhost:5000/api';
```

## 🎨 UI Components

```jsx
// Metric Card
<MetricCard 
  title="Total OTP" 
  value={1250} 
  icon={ChartBarIcon} 
  color="blue" 
  trend="+12%" 
/>

// Upgrade Banner
<UpgradeBanner
  title="Unlock SMS OTP"
  description="Send OTP via SMS"
  targetPlan="Growth"
  price="1,500 KES/mo"
/>

// Plan Badge
<PlanBadge />  // Shows current plan

// Feature Gate
<FeatureGate feature="sms_otp">
  <SMSButton />
</FeatureGate>
```

## 🚨 Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 402 | No active subscription | Subscribe to a plan |
| 403 | Feature not available | Upgrade plan |
| 403 | Channel not available | Upgrade plan |
| 403 | User limit reached | Upgrade or remove users |
| 429 | Rate limit exceeded | Wait and retry |

## 📈 Usage Tracking

```python
# Automatic logging
@log_api_usage('sms_otp')
def send_sms():
    pass  # Usage logged after success

# Manual logging
SubscriptionService.log_usage(
    user_id=user_id,
    usage_type='sms_otp',
    quantity=1,
    cost_kes=3.50,
    extra_data={'phone': '+254712345678'}
)

# Get usage stats
GET /api/subscription/usage?month=2024-01
```

## 🔄 Upgrade Flow

```
User clicks "Upgrade" 
  → Frontend: POST /api/subscription/upgrade
  → Backend: Validate plan
  → Backend: Cancel old subscription
  → Backend: Create new subscription
  → Backend: Return new subscription
  → Frontend: Refresh feature access
  → Features unlocked immediately
```

## 📚 Documentation Files

- `SAAS_IMPLEMENTATION_GUIDE.md` - Complete guide
- `FEATURE_GATING_API.md` - API reference
- `ARCHITECTURE_DIAGRAM.md` - Visual diagrams
- `IMPLEMENTATION_COMPLETE.md` - Summary
- `README_SAAS.md` - Main README

## 🎓 Learning Path

1. Read `SAAS_IMPLEMENTATION_GUIDE.md`
2. Review `ARCHITECTURE_DIAGRAM.md`
3. Check `FEATURE_GATING_API.md`
4. Run `./setup.sh`
5. Test all 4 plans
6. Review code in `/backend/app/subscription/`
7. Review code in `/src/components/dashboard/`

## 💡 Pro Tips

1. **Cache feature access** on frontend to reduce API calls
2. **Show locked features** with upgrade prompts (don't hide)
3. **Use middleware** for all protected endpoints
4. **Log usage** for accurate billing
5. **Test upgrade flows** thoroughly
6. **Monitor rate limits** per plan
7. **Use subscription_context** for read-only access checks

## 🔗 Quick Links

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/apidocs
- Health: http://localhost:5000/api/health

---

**Print this card and keep it handy! 📌**
