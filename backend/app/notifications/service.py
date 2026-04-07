import requests
from flask import current_app
from flask_mail import Message
from app.extensions import mail


# ══════════════════════════════════════════════════════════
#  EMAIL  (Flask-Mail → SMTP)
# ══════════════════════════════════════════════════════════

def send_email_otp(to_email: str, code: str):
    """Send OTP code via email using configured SMTP."""
    username = current_app.config.get('MAIL_USERNAME', '')
    if not username or username == 'your@gmail.com':
        current_app.logger.warning(f"[EMAIL] MAIL_USERNAME not configured — OTP code for {to_email}: {code}")
        return

    subject = f"{code} is your OTPGuard verification code"
    body    = _email_body(code)
    msg = Message(subject=subject, recipients=[to_email], html=body)
    try:
        mail.send(msg)
        current_app.logger.info(f"[EMAIL] OTP sent to {to_email}")
    except Exception as e:
        current_app.logger.error(f"[EMAIL] Failed to send to {to_email}: {e}")
        # Don't raise — OTP is already saved in DB, user can still verify


def _email_body(code: str) -> str:
    return f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;
                background:#0f1629;border-radius:12px;border:1px solid #1e2d4a;">
      <h2 style="color:#f1f5f9;margin-bottom:8px;">🔐 OTPGuard</h2>
      <p style="color:#94a3b8;margin-bottom:24px;">Your verification code:</p>
      <div style="background:#0a0e1a;border:1px solid #1e2d4a;border-radius:8px;
                  padding:20px;text-align:center;margin-bottom:24px;">
        <span style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#00ff88;
                     font-family:monospace;">{code}</span>
      </div>
      <p style="color:#94a3b8;font-size:.85rem;">
        This code expires in <strong style="color:#f1f5f9;">5 minutes</strong>.
        Never share it with anyone.
      </p>
      <hr style="border-color:#1e2d4a;margin:24px 0;"/>
      <p style="color:#475569;font-size:.75rem;">
        If you didn't request this, ignore this email or contact support.
      </p>
    </div>
    """


# ══════════════════════════════════════════════════════════
#  SMS  — tries Twilio first, falls back to Africa's Talking
# ══════════════════════════════════════════════════════════

def send_sms_otp(to_phone: str, code: str):
    """Send OTP via SMS. Uses Twilio if configured, else Africa's Talking."""
    message = f"Your OTPGuard code is: {code}. Valid for 5 minutes. Do not share."

    cfg = current_app.config
    if cfg.get("TWILIO_ACCOUNT_SID") and cfg.get("TWILIO_AUTH_TOKEN"):
        _send_twilio(to_phone, message)
    elif cfg.get("AT_API_KEY"):
        _send_africas_talking(to_phone, message)
    else:
        current_app.logger.warning("[SMS] No SMS provider configured — code not sent")


def _send_twilio(to_phone: str, message: str):
    cfg = current_app.config
    try:
        from twilio.rest import Client
        client = Client(cfg["TWILIO_ACCOUNT_SID"], cfg["TWILIO_AUTH_TOKEN"])
        client.messages.create(
            body=message,
            from_=cfg["TWILIO_PHONE_NUMBER"],
            to=to_phone
        )
        current_app.logger.info(f"[TWILIO] SMS sent to {to_phone}")
    except Exception as e:
        current_app.logger.error(f"[TWILIO] Failed: {e}")
        # Fallback to Africa's Talking
        if current_app.config.get("AT_API_KEY"):
            current_app.logger.info("[TWILIO] Falling back to Africa's Talking")
            _send_africas_talking(to_phone, message)
        else:
            raise


def _send_africas_talking(to_phone: str, message: str):
    cfg = current_app.config
    try:
        resp = requests.post(
            "https://api.africastalking.com/version1/messaging",
            headers={
                "apiKey":       cfg["AT_API_KEY"],
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept":       "application/json",
            },
            data={
                "username": cfg["AT_USERNAME"],
                "to":       to_phone,
                "message":  message,
            },
            timeout=10
        )
        resp.raise_for_status()
        current_app.logger.info(f"[AT] SMS sent to {to_phone}")
    except Exception as e:
        current_app.logger.error(f"[AT] Failed: {e}")
        raise
