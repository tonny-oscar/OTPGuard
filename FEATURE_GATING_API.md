# OTPGuard Feature Gating API Reference

## Overview

OTPGuard implements a sophisticated feature gating system that dynamically controls access to features based on subscription plans. This document outlines the complete API for managing and checking feature access.

---

## Authentication

All endpoints require JWT authentication unless specified otherwise.

```http
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get All Plans

Get list of all available subscription plans.

**Endpoint**: `GET /api/subscription/plans`

**Authentication**: None required

**Response**:
```json
{
  "plans": [
    {
      "id": 1,
      "name": "starter",
      "display_name": "Starter",
      "price_kes": 0,
      "price_usd": 0,
      "max_users": 50,
      "otp_channels": ["email"],
      "features": ["basic_dashboard"],
      "sms_enabled": false,
      "is_active": true
    },
    {
      "id": 2,
      "name": "growth",
      "display_name": "Growth (Most Popular)",
      "price_kes": 150000,
      "price_usd": 1000,
      "max_users": 1000,
      "otp_channels": ["email", "sms"],
      "features": ["basic_dashboard", "full_dashboard", "login_analytics"],
      "sms_enabled": true,
      "sms_cost_range": "2.00-5.00 KES",
      "is_active": true
    }
  ]
}
```

---

### 2. Get Current Subscription

Get the authenticated user's current subscription details.

**Endpoint**: `GET /api/subscription/current`

**Authentication**: Required

**Response**:
```json
{
  "subscription": {
    "id": 1,
    "user_id": 5,
    "plan": {
      "name": "growth",
      "display_name": "Growth (Most Popular)",
      "max_users": 1000,
      "otp_channels": ["email", "sms"],
      "features": ["basic_dashboard", "full_dashboard", "login_analytics"]
    },
    "status": "active",
    "start_date": "2024-01-15T10:00:00Z",
    "auto_renew": true
  },
  "is_trial": false
}
```

---

### 3. Check Feature Access

Check if the current user has access to all features.

**Endpoint**: `GET /api/features/check`

**Authentication**: Required

**Response**:
```json
{
  "plan": {
    "name": "growth",
    "display_name": "Growth (Most Popular)",
    "max_users": 1000,
    "otp_channels": ["email", "sms"],
    "features": ["basic_dashboard", "full_dashboard", "login_analytics"],
    "sms_enabled": true
  },
  "access": {
    "basic_dashboard": true,
    "full_dashboard": true,
    "admin_dashboard": false,
    "email_otp": true,
    "sms_otp": true,
    "totp": false,
    "device_tracking": false,
    "custom_branding": false,
    "white_label": false,
    "audit_logs": false,
    "custom_integrations": false,
    "analytics": true
  }
}
```

---

### 4. Check Specific Feature

Check if user has access to a specific feature.

**Endpoint**: `GET /api/subscription/check/feature/<feature_name>`

**Authentication**: Required

**Parameters**:
- `feature_name` (path): Feature to check (e.g., "sms_otp", "device_tracking")

**Response**:
```json
{
  "has_access": true,
  "message": "Feature 'sms_otp' available",
  "feature": "sms_otp"
}
```

**Error Response** (403):
```json
{
  "has_access": false,
  "message": "Feature 'device_tracking' not available in your plan",
  "feature": "device_tracking"
}
```

---

### 5. Check OTP Channel

Check if user can use a specific OTP channel.

**Endpoint**: `GET /api/subscription/check/channel/<channel_type>`

**Authentication**: Required

**Parameters**:
- `channel_type` (path): Channel to check ("email", "sms", "totp")

**Response**:
```json
{
  "has_access": true,
  "message": "Channel 'sms' allowed",
  "channel": "sms"
}
```

---

### 6. Check Usage Limits

Check current usage against plan limits.

**Endpoint**: `GET /api/subscription/check/limits`

**Authentication**: Required

**Response**:
```json
{
  "user_limit": {
    "within_limit": true,
    "message": "Within limit (45/1000)"
  },
  "plan_details": {
    "name": "growth",
    "max_users": 1000,
    "otp_channels": ["email", "sms"],
    "features": ["basic_dashboard", "full_dashboard", "login_analytics"]
  }
}
```

---

### 7. Get Feature Matrix

Get complete feature matrix for all plans (public endpoint).

**Endpoint**: `GET /api/features/matrix`

**Authentication**: None required

**Response**:
```json
{
  "matrix": {
    "starter": {
      "display_name": "Starter",
      "price_kes": 0,
      "price_usd": 0,
      "max_users": 50,
      "otp_channels": ["email"],
      "features": ["basic_dashboard"],
      "sms_enabled": false
    },
    "growth": {
      "display_name": "Growth (Most Popular)",
      "price_kes": 1500,
      "price_usd": 10,
      "max_users": 1000,
      "otp_channels": ["email", "sms"],
      "features": ["basic_dashboard", "full_dashboard", "login_analytics"],
      "sms_enabled": true,
      "sms_cost_range": "2.00-5.00 KES"
    },
    "business": {
      "display_name": "Business",
      "price_kes": 5000,
      "price_usd": 35,
      "max_users": -1,
      "otp_channels": ["email", "sms", "totp"],
      "features": [
        "basic_dashboard",
        "full_dashboard",
        "login_analytics",
        "admin_dashboard",
        "device_tracking",
        "geolocation",
        "custom_branding"
      ],
      "sms_enabled": true,
      "sms_cost_range": "1.00-3.00 KES"
    },
    "enterprise": {
      "display_name": "Enterprise (Custom)",
      "price_kes": 0,
      "price_usd": 0,
      "max_users": -1,
      "otp_channels": ["email", "sms", "totp"],
      "features": [
        "basic_dashboard",
        "full_dashboard",
        "login_analytics",
        "admin_dashboard",
        "device_tracking",
        "geolocation",
        "custom_branding",
        "white_label",
        "dedicated_support",
        "custom_limits"
      ],
      "sms_enabled": true,
      "sms_cost_range": "0.50-2.00 KES"
    }
  }
}
```

---

### 8. Subscribe to Plan

Subscribe user to a specific plan.

**Endpoint**: `POST /api/subscription/subscribe`

**Authentication**: Required

**Request Body**:
```json
{
  "plan_name": "growth"
}
```

**Response**:
```json
{
  "message": "Successfully subscribed to growth plan",
  "subscription": {
    "id": 1,
    "user_id": 5,
    "plan": {
      "name": "growth",
      "display_name": "Growth (Most Popular)"
    },
    "status": "active",
    "start_date": "2024-01-15T10:00:00Z"
  }
}
```

---

### 9. Upgrade Subscription

Upgrade to a higher-tier plan.

**Endpoint**: `POST /api/subscription/upgrade`

**Authentication**: Required

**Request Body**:
```json
{
  "plan_name": "business"
}
```

**Response**:
```json
{
  "message": "Successfully upgraded to business plan",
  "subscription": {
    "id": 2,
    "user_id": 5,
    "plan": {
      "name": "business",
      "display_name": "Business"
    },
    "status": "active"
  }
}
```

---

### 10. Get Usage Statistics

Get usage statistics for the current billing period.

**Endpoint**: `GET /api/subscription/usage`

**Authentication**: Required

**Query Parameters**:
- `month` (optional): Month in YYYY-MM format (defaults to current month)

**Response**:
```json
{
  "month": "2024-01",
  "total_users": 45,
  "email_otp_count": 1250,
  "sms_otp_count": 340,
  "totp_count": 0,
  "total_cost_kes": 1020.00,
  "plan_limits": {
    "max_users": 1000,
    "sms_enabled": true,
    "otp_channels": ["email", "sms"],
    "features": ["basic_dashboard", "full_dashboard", "login_analytics"]
  },
  "current_usage": {
    "users": 45,
    "users_percentage": 4.5
  }
}
```

---

## Error Codes

### 402 Payment Required
Returned when user doesn't have an active subscription.

```json
{
  "error": "Active subscription required",
  "code": "SUBSCRIPTION_REQUIRED"
}
```

### 403 Forbidden
Returned when user's plan doesn't include the requested feature.

```json
{
  "error": "Feature 'device_tracking' not available in your plan",
  "code": "FEATURE_NOT_AVAILABLE",
  "required_feature": "device_tracking"
}
```

### 403 Forbidden (Channel)
Returned when user's plan doesn't support the OTP channel.

```json
{
  "error": "Channel 'sms' not available in your plan",
  "code": "CHANNEL_NOT_AVAILABLE",
  "required_channel": "sms"
}
```

### 403 Forbidden (User Limit)
Returned when user has reached their plan's user limit.

```json
{
  "error": "User limit reached (50/50)",
  "code": "USER_LIMIT_REACHED"
}
```

### 429 Too Many Requests
Returned when rate limit is exceeded.

```json
{
  "error": "Rate limit exceeded. Max 5 OTP requests per 5 minutes",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 300
}
```

---

## Feature List

### Available Features

| Feature | Starter | Growth | Business | Enterprise |
|---------|---------|--------|----------|------------|
| `basic_dashboard` | ✅ | ✅ | ✅ | ✅ |
| `full_dashboard` | ❌ | ✅ | ✅ | ✅ |
| `admin_dashboard` | ❌ | ❌ | ✅ | ✅ |
| `login_analytics` | ❌ | ✅ | ✅ | ✅ |
| `device_tracking` | ❌ | ❌ | ✅ | ✅ |
| `geolocation` | ❌ | ❌ | ✅ | ✅ |
| `custom_branding` | ❌ | ❌ | ✅ | ✅ |
| `white_label` | ❌ | ❌ | ❌ | ✅ |
| `dedicated_support` | ❌ | ❌ | ❌ | ✅ |
| `custom_limits` | ❌ | ❌ | ❌ | ✅ |

### OTP Channels

| Channel | Starter | Growth | Business | Enterprise |
|---------|---------|--------|----------|------------|
| `email` | ✅ | ✅ | ✅ | ✅ |
| `sms` | ❌ | ✅ | ✅ | ✅ |
| `totp` | ❌ | ❌ | ✅ | ✅ |

---

## Usage Examples

### Python Example

```python
import requests

API_URL = "http://localhost:5000/api"
token = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Check feature access
response = requests.get(f"{API_URL}/features/check", headers=headers)
features = response.json()

if features['access']['sms_otp']:
    # Send SMS OTP
    requests.post(f"{API_URL}/mfa/send-sms", 
                  json={"phone": "+254712345678"},
                  headers=headers)
else:
    print("SMS not available in your plan")
```

### JavaScript Example

```javascript
const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// Check if user can use SMS
const checkSMS = async () => {
  const response = await fetch(`${API_URL}/subscription/check/channel/sms`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.has_access;
};

// Use in component
if (await checkSMS()) {
  // Show SMS option
} else {
  // Show upgrade prompt
}
```

---

## Best Practices

1. **Cache Feature Access**: Cache the feature check response on the frontend to avoid repeated API calls.

2. **Graceful Degradation**: Always show locked features with upgrade prompts rather than hiding them completely.

3. **Real-time Updates**: Refresh feature access after subscription changes.

4. **Error Handling**: Handle 402 and 403 errors gracefully with upgrade CTAs.

5. **Usage Monitoring**: Track usage regularly to warn users before hitting limits.

---

**Last Updated**: January 2024
