"""
app/email_templates.py
Professional HTML email templates for all OTPGuard notifications.
"""


BASE_STYLE = """
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0a0e1a;
  margin: 0;
  padding: 0;
"""

def _wrap(content: str, preview: str = '') -> str:
    """Wrap content in the base email layout."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>OTPGuard</title>
  {'<meta name="x-apple-disable-message-reformatting"/>' if preview else ''}
</head>
<body style="{BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:1.5rem;font-weight:900;color:#f1f5f9;letter-spacing:-.02em;">
        OTP<span style="color:#00ff88;">Guard</span>
      </span>
      <div style="font-size:.65rem;color:rgba(0,255,136,.55);font-weight:700;
                  letter-spacing:3px;text-transform:uppercase;margin-top:4px;">
        MFA Platform
      </div>
    </div>

    <!-- Card -->
    <div style="background:#0f1629;border:1px solid #1e2d4a;border-radius:16px;
                padding:40px 36px;margin-bottom:24px;">
      {content}
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#475569;font-size:.75rem;line-height:1.8;">
      <p style="margin:0;">© 2025 OTPGuard · Secure MFA Platform</p>
      <p style="margin:4px 0 0;">
        <a href="https://otpguard-1.onrender.com" style="color:#00ff88;text-decoration:none;">
          otpguard.co.ke
        </a>
        &nbsp;·&nbsp;
        <a href="mailto:otpguard26@gmail.com" style="color:#64748b;text-decoration:none;">
          Support
        </a>
      </p>
    </div>

  </div>
</body>
</html>"""


def otp_email(code: str, method: str = 'email') -> str:
    """OTP verification code email."""
    content = f"""
      <h2 style="color:#f1f5f9;font-size:1.4rem;font-weight:800;margin:0 0 8px;">
        🔐 Verification Code
      </h2>
      <p style="color:#94a3b8;margin:0 0 28px;font-size:.95rem;">
        Use the code below to complete your sign-in.
      </p>

      <div style="background:#0a0e1a;border:1px solid #1e2d4a;border-radius:12px;
                  padding:28px;text-align:center;margin-bottom:28px;">
        <div style="font-size:2.8rem;font-weight:900;letter-spacing:14px;
                    color:#00ff88;font-family:monospace;">{code}</div>
      </div>

      <div style="background:rgba(0,255,136,.06);border:1px solid rgba(0,255,136,.15);
                  border-radius:8px;padding:14px 18px;margin-bottom:24px;">
        <p style="color:#94a3b8;font-size:.85rem;margin:0;">
          ⏱ Expires in <strong style="color:#f1f5f9;">5 minutes</strong>
          &nbsp;·&nbsp;
          🔒 Never share this code
        </p>
      </div>

      <p style="color:#475569;font-size:.8rem;margin:0;">
        If you didn't request this code, you can safely ignore this email.
        Someone may have entered your email by mistake.
      </p>
    """
    return _wrap(content)


def welcome_email(full_name: str, plan: str = 'starter') -> str:
    """Welcome email for new users."""
    name = full_name or 'there'
    content = f"""
      <h2 style="color:#f1f5f9;font-size:1.4rem;font-weight:800;margin:0 0 8px;">
        👋 Welcome to OTPGuard, {name}!
      </h2>
      <p style="color:#94a3b8;margin:0 0 24px;font-size:.95rem;">
        Your account is ready. You're on the
        <strong style="color:#00ff88;">{plan.capitalize()}</strong> plan.
      </p>

      <div style="border-top:1px solid #1e2d4a;padding-top:24px;margin-bottom:24px;">
        {''.join([f"""
        <div style="display:flex;align-items:flex-start;margin-bottom:16px;">
          <span style="font-size:1.2rem;margin-right:12px;">{icon}</span>
          <div>
            <div style="color:#f1f5f9;font-weight:700;font-size:.9rem;">{title}</div>
            <div style="color:#64748b;font-size:.82rem;margin-top:2px;">{desc}</div>
          </div>
        </div>
        """ for icon, title, desc in [
            ('🔐', 'Multi-Factor Authentication', 'Protect every login with OTP via email, SMS, or authenticator app'),
            ('📊', 'Analytics Dashboard', 'Monitor your authentication activity in real-time'),
            ('🔑', 'API Keys', 'Integrate OTPGuard into your own applications'),
            ('📱', 'Device Management', 'Track and manage trusted devices'),
        ]])}
      </div>

      <a href="https://otpguard-1.onrender.com/dashboard"
         style="display:block;text-align:center;background:linear-gradient(135deg,#00ff88,#00cc6a);
                color:#0a0e1a;font-weight:800;font-size:1rem;padding:14px;border-radius:10px;
                text-decoration:none;margin-bottom:16px;">
        Go to Dashboard →
      </a>
    """
    return _wrap(content)


def password_reset_email(reset_link: str, full_name: str = '') -> str:
    """Password reset email."""
    name = full_name or 'there'
    content = f"""
      <h2 style="color:#f1f5f9;font-size:1.4rem;font-weight:800;margin:0 0 8px;">
        🔑 Reset Your Password
      </h2>
      <p style="color:#94a3b8;margin:0 0 24px;font-size:.95rem;">
        Hi {name}, we received a request to reset your OTPGuard password.
      </p>

      <a href="{reset_link}"
         style="display:block;text-align:center;background:linear-gradient(135deg,#00ff88,#00cc6a);
                color:#0a0e1a;font-weight:800;font-size:1rem;padding:14px;border-radius:10px;
                text-decoration:none;margin-bottom:24px;">
        Reset Password →
      </a>

      <div style="background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);
                  border-radius:8px;padding:14px 18px;margin-bottom:24px;">
        <p style="color:#f87171;font-size:.85rem;margin:0;">
          ⚠️ This link expires in <strong>1 hour</strong>.
          If you didn't request this, please ignore this email.
        </p>
      </div>

      <p style="color:#475569;font-size:.8rem;margin:0;">
        For security, this link can only be used once.
        If you need help, contact <a href="mailto:otpguard26@gmail.com"
        style="color:#00ff88;">support</a>.
      </p>
    """
    return _wrap(content)


def security_alert_email(full_name: str, event: str, ip: str, location: str = 'Unknown') -> str:
    """Security alert email for suspicious activity."""
    name = full_name or 'there'
    content = f"""
      <h2 style="color:#f87171;font-size:1.4rem;font-weight:800;margin:0 0 8px;">
        🚨 Security Alert
      </h2>
      <p style="color:#94a3b8;margin:0 0 24px;font-size:.95rem;">
        Hi {name}, we detected unusual activity on your account.
      </p>

      <div style="background:#0a0e1a;border:1px solid #1e2d4a;border-radius:12px;
                  padding:20px;margin-bottom:24px;">
        <div style="margin-bottom:12px;">
          <span style="color:#64748b;font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;">Event</span>
          <div style="color:#f1f5f9;font-weight:700;margin-top:4px;">{event}</div>
        </div>
        <div style="margin-bottom:12px;">
          <span style="color:#64748b;font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;">IP Address</span>
          <div style="color:#f1f5f9;font-weight:700;margin-top:4px;">{ip}</div>
        </div>
        <div>
          <span style="color:#64748b;font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;">Location</span>
          <div style="color:#f1f5f9;font-weight:700;margin-top:4px;">{location}</div>
        </div>
      </div>

      <p style="color:#94a3b8;font-size:.88rem;margin:0 0 16px;">
        If this was you, no action is needed. If you don't recognize this activity,
        please secure your account immediately.
      </p>

      <a href="https://otpguard-1.onrender.com/dashboard"
         style="display:block;text-align:center;background:rgba(248,113,113,.15);
                border:1px solid rgba(248,113,113,.3);
                color:#f87171;font-weight:700;font-size:.9rem;padding:12px;border-radius:10px;
                text-decoration:none;">
        Review Account Activity →
      </a>
    """
    return _wrap(content)


def subscription_email(full_name: str, plan: str, action: str = 'upgraded') -> str:
    """Subscription change confirmation email."""
    name = full_name or 'there'
    action_text = {
        'upgraded': ('🎉', 'Plan Upgraded!', f"You're now on the {plan.capitalize()} plan."),
        'cancelled': ('😢', 'Subscription Cancelled', f"Your {plan.capitalize()} plan has been cancelled."),
        'renewed': ('✅', 'Subscription Renewed', f"Your {plan.capitalize()} plan has been renewed."),
    }.get(action, ('📋', 'Subscription Updated', f"Your plan has been updated to {plan.capitalize()}."))

    icon, title, subtitle = action_text
    content = f"""
      <h2 style="color:#f1f5f9;font-size:1.4rem;font-weight:800;margin:0 0 8px;">
        {icon} {title}
      </h2>
      <p style="color:#94a3b8;margin:0 0 24px;font-size:.95rem;">
        Hi {name}, {subtitle}
      </p>

      <div style="background:rgba(0,255,136,.06);border:1px solid rgba(0,255,136,.15);
                  border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <div style="color:#64748b;font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;">
          Current Plan
        </div>
        <div style="color:#00ff88;font-size:1.8rem;font-weight:900;margin-top:8px;">
          {plan.capitalize()}
        </div>
      </div>

      <a href="https://otpguard-1.onrender.com/dashboard"
         style="display:block;text-align:center;background:linear-gradient(135deg,#00ff88,#00cc6a);
                color:#0a0e1a;font-weight:800;font-size:1rem;padding:14px;border-radius:10px;
                text-decoration:none;">
        View Dashboard →
      </a>
    """
    return _wrap(content)


def contact_reply_email(name: str, original_subject: str, reply_body: str, original_message: str) -> str:
    """Admin reply to contact form submission."""
    content = f"""
      <h2 style="color:#f1f5f9;font-size:1.4rem;font-weight:800;margin:0 0 8px;">
        💬 Reply from OTPGuard Support
      </h2>
      <p style="color:#94a3b8;margin:0 0 24px;font-size:.95rem;">
        Hi {name}, here's our response to your message.
      </p>

      <div style="color:#f1f5f9;line-height:1.8;font-size:.95rem;
                  white-space:pre-wrap;margin-bottom:28px;">
        {reply_body}
      </div>

      <div style="background:#0a0e1a;border:1px solid #1e2d4a;border-radius:8px;
                  padding:16px;margin-bottom:24px;">
        <p style="color:#64748b;font-size:.75rem;margin:0 0 8px;
                  text-transform:uppercase;letter-spacing:.5px;">
          Your original message
        </p>
        <p style="color:#94a3b8;font-size:.85rem;margin:0;white-space:pre-wrap;">
          {original_message}
        </p>
      </div>

      <p style="color:#475569;font-size:.8rem;margin:0;">
        Need more help? Reply to this email or visit our
        <a href="https://otpguard-1.onrender.com/docs" style="color:#00ff88;">documentation</a>.
      </p>
    """
    return _wrap(content)
