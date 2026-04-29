# 🛡️ OTPGuard - Multi-Tenant SaaS Platform

A production-ready, scalable multi-tenant SaaS application for OTP (One-Time Password) management with subscription-based feature gating.

## 🌟 Key Features

### ✅ **Unified Dashboard Architecture**
- Single codebase for all subscription tiers
- Dynamic feature gating based on plan
- Real-time subscription management
- Seamless upgrade/downgrade flows

### 🔐 **Multi-Factor Authentication**
- Email OTP
- SMS OTP (Growth+)
- TOTP/Authenticator Apps (Business+)
- Backup Codes (Business+)

### 📊 **Subscription Plans**

| Feature | Starter | Growth | Business | Enterprise |
|---------|---------|--------|----------|------------|
| **Price** | Free | 1,500 KES/mo | 5,000 KES/mo | Custom |
| **Max Users** | 50 | 1,000 | Unlimited | Unlimited |
| **Email OTP** | ✅ | ✅ | ✅ | ✅ |
| **SMS OTP** | ❌ | ✅ | ✅ | ✅ |
| **TOTP** | ❌ | ❌ | ✅ | ✅ |
| **Analytics** | Basic | Full | Advanced | Enterprise |
| **Device Tracking** | ❌ | ❌ | ✅ | ✅ |
| **Custom Branding** | ❌ | ❌ | ✅ | ✅ |
| **White Label** | ❌ | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ✅ | ✅ | ✅ |
| **Support** | Community | Email | Priority | Dedicated |

## 🏗️ Architecture

### Backend (Python/Flask)
```
backend/
├── app/
│   ├── auth/           # Authentication routes
│   ├── mfa/            # OTP management
│   ├── subscription/   # Subscription & feature gating
│   │   ├── routes.py
│   │   ├── service.py
│   │   ├── middleware.py
│   │   └── features.py
│   ├── models.py       # Database models
│   └── __init__.py
├── config.py
└── run.py
```

### Frontend (React/Vite)
```
src/
├── components/
│   ├── dashboard/
│   │   ├── modules/        # Plan-specific modules
│   │   ├── widgets/        # Reusable widgets
│   │   ├── Sidebar.jsx     # Dynamic navigation
│   │   └── UnifiedDashboard.jsx
│   └── shared/
│       ├── FeatureGate.jsx
│       └── UpgradePrompt.jsx
├── hooks/
│   ├── useSubscription.js
│   └── useFeatureFlag.js
└── utils/
    └── planPermissions.js
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip & npm

### Automated Setup

```bash
# Clone the repository
git clone <repository-url>
cd OTPGuard

# Run setup script
./setup.sh
```

### Manual Setup

#### Backend
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_subscriptions.py

# Run server
python run.py
```

#### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/apidocs

## 📖 Documentation

- **[Implementation Guide](SAAS_IMPLEMENTATION_GUIDE.md)** - Complete architecture and implementation details
- **[API Reference](FEATURE_GATING_API.md)** - Feature gating API documentation
- **[Testing Guide](TESTING_GUIDE.md)** - Testing strategies and examples

## 🔑 Feature Gating

### Backend Example
```python
from app.subscription.middleware import require_feature

@mfa_bp.route('/send-sms', methods=['POST'])
@require_feature('sms_otp')
def send_sms_otp():
    # Only accessible if user's plan includes SMS
    pass
```

### Frontend Example
```jsx
import { useFeatureGate } from '../hooks/useFeatureFlag';

function SMSButton() {
  const { hasAccess, upgradeInfo } = useFeatureGate('sms_otp');
  
  if (!hasAccess) {
    return <UpgradePrompt upgradeInfo={upgradeInfo} />;
  }
  
  return <button onClick={sendSMS}>Send SMS</button>;
}
```

## 🎯 Key Endpoints

### Subscription Management
```
GET  /api/subscription/plans          # List all plans
GET  /api/subscription/current        # Get user's subscription
POST /api/subscription/subscribe      # Subscribe to plan
POST /api/subscription/upgrade        # Upgrade plan
GET  /api/subscription/usage          # Get usage stats
```

### Feature Gating
```
GET /api/features/check                      # Check all features
GET /api/features/matrix                     # Get feature matrix
GET /api/subscription/check/feature/:name    # Check specific feature
GET /api/subscription/check/channel/:type    # Check OTP channel
```

## 💡 Usage Examples

### Check Feature Access
```javascript
// Frontend
const response = await api.get('/features/check');
const { access } = response.data;

if (access.sms_otp) {
  // Show SMS option
} else {
  // Show upgrade prompt
}
```

### Subscribe to Plan
```javascript
// Frontend
await api.post('/subscription/subscribe', {
  plan_name: 'growth'
});
```

### Protected Backend Route
```python
# Backend
@require_subscription
@require_feature('device_tracking')
def get_devices():
    return jsonify(devices)
```

## 🧪 Testing

### Test Feature Gates
```bash
# Register user (auto-assigned Starter plan)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Try SMS (should fail on Starter)
curl -X POST http://localhost:5000/api/mfa/send-sms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+254712345678"}'

# Upgrade to Growth
curl -X POST http://localhost:5000/api/subscription/upgrade \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"plan_name":"growth"}'

# Try SMS again (should succeed)
```

## 🔒 Security Features

- JWT-based authentication
- API key authentication for integrations
- Rate limiting per plan tier
- Subscription-based access control
- Audit logging (Enterprise)

## 📊 Usage Tracking

Automatic usage logging for billing:
- Email OTP sends
- SMS OTP sends (with cost calculation)
- TOTP verifications
- User additions

```python
# Automatically logged
@log_api_usage('sms_otp')
def send_sms():
    pass
```

## 🌐 Environment Variables

Create `backend/.env`:
```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///otpguard.db

# Email (SMTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 🚢 Deployment

### Production Checklist
- [ ] Set strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure production email service
- [ ] Set up SMS provider (Twilio/Africa's Talking)
- [ ] Enable HTTPS
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Load test subscription endpoints
- [ ] Test all plan upgrade/downgrade flows

### Docker Deployment
```bash
# Coming soon
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: See `/docs` folder
- **API Docs**: http://localhost:5000/apidocs
- **Issues**: GitHub Issues
- **Email**: support@otpguard.co.ke

## 🎉 Acknowledgments

Built with:
- Flask (Backend)
- React + Vite (Frontend)
- Tailwind CSS (Styling)
- SQLAlchemy (ORM)
- JWT (Authentication)

---

**Built with ❤️ for scalable SaaS applications**

*OTPGuard - Secure, Scalable, Simple*
