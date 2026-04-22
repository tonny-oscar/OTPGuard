# Email & SMS OTP Sending - Testing Guide ✅

## 🎯 What's Now Enabled

✅ **Email Sending** - Gmail SMTP configured
✅ **SMS via Twilio** - Primary SMS provider  
✅ **SMS via Africa's Talking** - Fallback SMS provider
✅ **Automatic Failover** - If Twilio fails, tries Africa's Talking
✅ **Dev Mode Logging** - Logs codes to console if all providers fail

---

## 📧 Email Testing



### Test Steps

1. **Restart Backend**
```bash
cd C:\Users\user-pc\OTPGuard\backend
python run.py
```

2. **Login with Email**
   - Go to `http://localhost:5173/login`
   - Use email: `testuser@gmail.com` 
   - Use password: `Test1234`
   - Click "Sign In"

3. **Reach OTP Screen**
   - Should reach OTP verification screen
   - Check backend terminal for:
```
[EMAIL] Sending OTP to testuser@gmail.com via smtp.gmail.com:587
[EMAIL] ✅ OTP sent successfully to testuser@gmail.com
```

4. **Check Gmail Inbox**
   - Go to `betttonny26@gmail.com` Gmail account
   - Look for email from `noreply@otpguard.co.ke`
   - Subject: `[CODE] is your OTPGuard verification code`
   - Contains: 6-digit OTP code

5. **Verify Code**
   - Copy OTP from email
   - Paste into login screen
   - Click "Verify Code"
   - **Should successfully login** ✅


### Test Steps

1. **Register with Phone Number**
   - Go to `http://localhost:5173/register`
   - Fill form with:
     - Email: `testsms@example.com`
     - Phone: `+254700000000` (or your real number)
     - Password: `Test1234`
   - Click "Sign Up"

2. **Check Backend Terminal for OTP**
```
[TWILIO] Sending SMS to +254700000000...
[TWILIO] ✅ SMS sent successfully to +254700000000 (SID: SMxxxxxxxxxxxxxxxxxxxxxxxx)
```

3. **Receive SMS**
   - Check your phone for SMS from Twilio
   - Message: "Your OTPGuard code is: [CODE]. Valid for 5 minutes..."

4. **Use OTP**
   - Copy code from SMS
   - Paste into OTP screen
   - Click "Verify Code"
   - **Should successfully login** ✅

---

## 📋 Backend Log Examples

### Successful Email
```
[EMAIL] Sending OTP to user@example.com via smtp.gmail.com:587
[EMAIL] ✅ OTP sent successfully to user@example.com
[SEND] OTP sent to user 1 via email
```

### Successful SMS (Twilio)
```
[TWILIO] Sending SMS to +254700000000...
[TWILIO] ✅ SMS sent successfully to +254700000000 (SID: SM1234567890abcdef)
[SEND] OTP sent to user 1 via sms
```

### Successful SMS (Africa's Talking Fallback)
```
[TWILIO] Sending SMS to +254700000000...
[TWILIO] ❌ Failed to send to +254700000000: [error message]
[SMS] Twilio failed, trying Africa's Talking...
[AfricasTalking] Sending SMS to +254700000000...
[AfricasTalking] ✅ SMS sent successfully to +254700000000
```

### Dev Mode (All Failed)
```
[SMS] ⚠️  All SMS providers failed
[SMS] 📱 Dev Mode - SMS CODE FOR +254700000000: 123456
[SMS] Valid for 5 minutes. Use code above for testing.
```

---

## 🔧 How to Test Different Scenarios

### Test 1: Email Sending
```bash
# In backend terminal, watch for:
# [EMAIL] ✅ OTP sent successfully

# In Gmail inbox:
# From: noreply@otpguard.co.ke
# Subject: [CODE] is your OTPGuard verification code
```

### Test 2: SMS via Twilio
```bash
# In backend terminal, watch for:
# [TWILIO] ✅ SMS sent successfully

# On your phone:
# SMS from Twilio number (+17407476845)
# "Your OTPGuard code is: [CODE]. Valid for 5 minutes..."
```

### Test 3: SMS via Africa's Talking (Fallback)
1. Temporarily disable Twilio in .env:
   - Comment out `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
   
2. Register with phone number

3. Check backend terminal for:
   ```
   [AfricasTalking] ✅ SMS sent successfully
   ```

4. Receive SMS on phone

### Test 4: Dev Mode (No Providers)
1. Comment out ALL SMS/Email credentials in .env
2. Restart backend
3. Try to login
4. Check terminal for OTP code in logs:
   ```
   [EMAIL] 📱 Dev Mode - SMS CODE FOR user@example.com: 123456
   ```

---

## ⚙️ Configuration

### Change Email Provider
In `config.py`, modify:
```python
MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')  # ← Change SMTP server
MAIL_PORT = int(os.getenv('MAIL_PORT', 587))             # ← Port 587 for TLS, 465 for SSL
```

### Add Another SMS Provider
In `app/notifications/service.py`, add to `send_sms_otp()`:
```python
# Try your new provider
if cfg.get("YOUR_PROVIDER_KEY"):
    try:
        _send_your_provider(to_phone, message)
        sent = True
    except Exception as e:
        current_app.logger.warning(f"[YOUR_PROVIDER] Failed...")
```

---

## 🐛 Troubleshooting

### Email Not Sending
1. **Check credentials** - In .env, verify:
   ```
   MAIL_USERNAME is not 'your@gmail.com'
   MAIL_PASSWORD is not 'your-app-password'
   ```
   
2. **Gmail App Password**
   - Go to myaccount.google.com → Security
   - Enable 2-Step Verification
   - Create App Password for "OTPGuard"
   - Use that password in .env

3. **Check logs** - Look for:
   ```
   [EMAIL] ❌ Failed to send
   ```
   - If you see this, check Gmail SMTP settings

### SMS Not Sending
1. **Check Twilio credentials**
   - Go to twilio.com/console
   - Copy ACCOUNT_SID and AUTH_TOKEN
   - Verify PHONE_NUMBER is correct (e.g., +17407476845)

2. **Check Africa's Talking credentials**
   - Go to africastalking.com dashboard
   - Copy API_KEY and USERNAME
   - Try SMS manually from dashboard

3. **Check logs** for specific errors:
   ```
   [TWILIO] ❌ Failed: [specific error]
   [AfricasTalking] ❌ Failed: [specific error]
   ```

### OTP Code Logic Wrong
1. Check backend for code generation:
   ```
   python -c "from app import create_app; app = create_app(); 
   with app.app_context(): 
     print(f'OTP_LENGTH: {app.config[\"OTP_LENGTH\"]}'); 
     print(f'OTP_EXPIRY_SECONDS: {app.config[\"OTP_EXPIRY_SECONDS\"]}')"
   ```

---

## ✅ Production Checklist

- [ ] Email credentials configured (not default placeholders)
- [ ] SMS provider credentials configured
- [ ] Flask-Mail, Twilio, Requests libraries installed
- [ ] CORS properly configured (should already be done)
- [ ] OTP expires after 5 minutes
- [ ] OTP length is 6 digits
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting on resend (3 attempts per 15 min)

---

## 📊 Summary

| Provider | Status | Credentials | Fallback |
|----------|--------|-------------|----------|
| Gmail SMTP | ✅ Active | Configured in .env | Shows code in terminal |
| Twilio SMS | ✅ Active | Configured in .env | Falls back to Africa's Talking |
| Africa's Talking SMS | ✅ Active | Configured in .env | Shows code in terminal |

**All email and SMS sending is now fully functional!** 🎉
