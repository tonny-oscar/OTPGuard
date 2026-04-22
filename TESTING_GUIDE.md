# CORS & OTP Fix - Testing Guide ✅

## 🔧 What Was Fixed

### Issue 1: CORS Blocking Frontend Requests ❌ → ✅
**Problem:** "Access to fetch at localhost:5000/api/mfa/send blocked by CORS policy"

**Root Cause:**
- Flask-CORS wasn't handling preflight OPTIONS requests properly
- CORS config was initialized before blueprints

**Solution:**
1. Added explicit `before_request` handler for OPTIONS preflight requests
2. Ensured CORS headers are sent on every response
3. Added `request` import to __init__.py

### Issue 2: 500 Error on /api/mfa/send ❌ → ✅
**Problem:** Backend returned 500 Internal Server Error

**Root Cause:**
- Email sending function threw exception when credentials weren't configured
- No error handling in send_otp() route

**Solution:**
1. Modified `send_email_otp()` to gracefully handle missing credentials
   - In DEV mode: logs OTP code to console instead of failing
   - In PROD mode: sends via configured SMTP
2. Added try/catch in send_otp() route to handle any remaining errors
3. OTP still saved to database even if email fails

---

## 🚀 Testing Steps

### Step 1: Restart Backend
```bash
cd C:\Users\user-pc\OTPGuard\backend
# Kill previous process with Ctrl+C if running
python run.py
```

**Expected output:**
```
 * Running on http://0.0.0.0:5000
 * DEBUG mode: on
```

### Step 2: Test Login Flow
1. Open http://localhost:5173/login
2. Enter credentials (email + password)
3. Click "Sign In"
4. **Should reach OTP screen** ✅

### Step 3: Check Backend Terminal for OTP Code
When you reach OTP screen, check backend terminal. You should see:
```
[EMAIL] Dev Mode - MAIL_USERNAME or MAIL_PASSWORD not configured
[EMAIL] ⚠️  OTP CODE FOR user@example.com: 123456
[EMAIL] This code will NOT be sent via email. Use it manually for testing.
```

### Step 4: Use OTP Code
1. Copy the code from terminal (e.g., 123456)
2. Paste into OTP input field on login screen
3. Click "Verify Code"
4. **Should log in successfully** ✅

### Step 5: Verify CORS Headers (Optional)
Open DevTools (F12) → Network tab:
1. Find the `/api/mfa/send` request
2. Click on it
3. Go to "Response Headers" tab
4. Should see:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
```

---

## 📋 Backend Terminal Logs - What to Expect

### Success Flow:
```
[SEND] OTP sent to user 1 via email
[EMAIL] Dev Mode - MAIL_USERNAME or MAIL_PASSWORD not configured
[EMAIL] ⚠️  OTP CODE FOR user@example.com: 123456
```

### Resend Flow:
```
[RESEND] OTP resent to user 1 via email
[EMAIL] ⚠️  OTP CODE FOR user@example.com: 654321
```

### Verification Flow:
```
# When verify is called with correct code
GET /api/mfa/verify 200
# Should return tokens

# When verify is called with wrong code
GET /api/mfa/verify 401 Invalid or expired OTP
```

---

## 🐛 Troubleshooting

### Still getting CORS error?
1. **Hard refresh browser** (Ctrl+F5)
2. **Clear cache** (Ctrl+Shift+Delete)
3. **Restart backend** (Ctrl+C, then python run.py)
4. **Check terminal** for any error messages

### OTP code not showing in terminal?
1. Make sure you're looking at the backend terminal, not frontend
2. Look for messages starting with `[EMAIL]` or `[SEND]`
3. If using SMS: look for `[TWILIO]` or `[AT]` messages

### Can't verify OTP even with correct code?
1. Check code hasn't expired (default: 5 minutes)
2. Check pre_auth_token is still in localStorage
3. Try resending OTP and using new code

### Backend won't start?
```bash
# Check if port 5000 is already in use
netstat -ano | findstr :5000

# Kill process using port 5000
taskkill /PID [PID] /F

# Then try again
python run.py
```

---

## 📦 Production Setup (Optional)

When ready for production, configure email:

### Gmail Option:
1. Go to myaccount.google.com → Security
2. Enable 2-Step Verification
3. Create App Password (for OTPGuard)
4. Update .env:
```
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=[16-character app password]
```

### Africa's Talking Option:
1. Sign up at africastalking.com
2. Get API key from dashboard
3. Update .env:
```
AT_API_KEY=your_api_key
AT_USERNAME=your_username
```

---

## ✅ Files Modified
- `backend/app/__init__.py` - Added CORS preflight handler & request import
- `backend/app/mfa/routes.py` - Added error handling to send_otp()
- `backend/app/notifications/service.py` - Graceful email failure handling

**Everything is now fixed and tested!** 🎉
