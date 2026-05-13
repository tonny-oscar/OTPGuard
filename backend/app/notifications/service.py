import requests
from flask import current_app
from flask_mail import Message
from app.extensions import mail
from app.email_templates import otp_email


# ══════════════════════════════════════════════════════════
#  EMAIL  (Flask-Mail → SMTP)
# ══════════════════════════════════════════════════════════

def send_email_otp(to_email: str, code: str):
    """Send OTP code via email using configured SMTP."""
    username = current_app.config.get('MAIL_USERNAME', '')
    password = current_app.config.get('MAIL_PASSWORD', '')

    if not username or not password:
        current_app.logger.warning(f"[EMAIL] Credentials not configured — OTP for {to_email}: {code}")
        return

    msg = Message(
        subject=f"{code} is your OTPGuard verification code",
        recipients=[to_email],
        html=otp_email(code)
    )
    try:
        mail.send(msg)
        current_app.logger.info(f"[EMAIL] ✅ OTP sent to {to_email}")
    except Exception as e:
        current_app.logger.error(f"[EMAIL] ❌ Failed to send to {to_email}: {e}")
        _alert_email_failure(to_email, str(e))
        raise


# ══════════════════════════════════════════════════════════
#  SMS  — tries Twilio first, falls back to Africa's Talking
# ══════════════════════════════════════════════════════════

def send_sms_otp(to_phone: str, code: str):
    """Send OTP via SMS. Uses Twilio if configured, else Africa's Talking."""
    message = f"Your OTPGuard code is: {code}. Valid for 5 minutes. Do not share."
    cfg = current_app.config

    if cfg.get("TWILIO_ACCOUNT_SID") and cfg.get("TWILIO_AUTH_TOKEN"):
        try:
            _send_twilio(to_phone, message)
            return
        except Exception as e:
            current_app.logger.warning(f"[SMS] Twilio failed: {e} — trying Africa's Talking")
            _alert_sms_failure(to_phone, "Twilio", str(e))

    if cfg.get("AT_API_KEY"):
        try:
            _send_africas_talking(to_phone, message)
            return
        except Exception as e:
            current_app.logger.error(f"[SMS] Africa's Talking also failed: {e}")
            _alert_sms_failure(to_phone, "Africa's Talking", str(e))

    current_app.logger.warning(f"[SMS] All providers failed — OTP for {to_phone}: {code}")


def _send_twilio(to_phone: str, message: str):
    cfg = current_app.config
    from twilio.rest import Client
    client = Client(cfg["TWILIO_ACCOUNT_SID"], cfg["TWILIO_AUTH_TOKEN"])
    response = client.messages.create(
        body=message,
        from_=cfg["TWILIO_PHONE_NUMBER"],
        to=to_phone
    )
    current_app.logger.info(f"[TWILIO] ✅ SMS sent to {to_phone} (SID: {response.sid})")


def _send_africas_talking(to_phone: str, message: str):
    cfg = current_app.config
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
    current_app.logger.info(f"[AT] ✅ SMS sent to {to_phone}")


# ══════════════════════════════════════════════════════════
#  MONITORING ALERT HELPERS  (fire-and-forget)
# ══════════════════════════════════════════════════════════

def _alert_sms_failure(phone: str, provider: str, error: str):
    try:
        from app.monitoring import MonitoringService
        MonitoringService.alert_sms_delivery_failure(phone, provider, error)
    except Exception:
        pass  # Never let monitoring break the main flow


def _alert_email_failure(email: str, error: str):
    try:
        from app.monitoring import MonitoringService
        MonitoringService.alert_email_delivery_failure(email, error)
    except Exception:
        pass
