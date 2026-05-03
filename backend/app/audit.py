"""
app/audit.py
Audit logging for security-relevant events.
All events are emitted as structured JSON log lines.
Sensitive fields (passwords, OTP codes) are NEVER logged.
"""
import logging
from datetime import datetime, timezone

audit_log = logging.getLogger('otpguard.audit')


def _emit(event: str, **fields):
    """Emit a structured audit event. Strips any sensitive keys."""
    _NEVER_LOG = {'password', 'code', 'otp', 'token', 'secret', 'hash'}
    safe = {k: v for k, v in fields.items() if k.lower() not in _NEVER_LOG}
    audit_log.info(
        event,
        extra={
            'audit':      True,
            'event':      event,
            'ts':         datetime.now(timezone.utc).isoformat(),
            **safe,
        }
    )


# ── Auth events ───────────────────────────────────────────────────

def log_login_attempt(email: str, ip: str, success: bool, reason: str = ''):
    _emit(
        'auth.login',
        email=email,
        ip=ip,
        success=success,
        reason=reason,
    )


def log_register(email: str, ip: str, plan: str):
    _emit(
        'auth.register',
        email=email,
        ip=ip,
        plan=plan,
    )


def log_logout(user_id: int, ip: str):
    _emit('auth.logout', user_id=user_id, ip=ip)


# ── MFA / OTP events ──────────────────────────────────────────────

def log_otp_sent(user_id: int, method: str, ip: str):
    """Log that an OTP was dispatched — never log the code itself."""
    _emit('otp.sent', user_id=user_id, method=method, ip=ip)


def log_otp_verified(user_id: int, method: str, ip: str, success: bool):
    _emit('otp.verified', user_id=user_id, method=method, ip=ip, success=success)


def log_otp_resent(user_id: int, method: str, ip: str):
    _emit('otp.resent', user_id=user_id, method=method, ip=ip)


def log_mfa_reset(admin_id: int, target_user_id: int, ip: str):
    _emit('mfa.reset', admin_id=admin_id, target_user_id=target_user_id, ip=ip)


# ── Subscription events ───────────────────────────────────────────

def log_subscription_created(user_id: int, plan: str, ip: str = ''):
    _emit('subscription.created', user_id=user_id, plan=plan, ip=ip)


def log_subscription_upgraded(user_id: int, old_plan: str, new_plan: str, ip: str = ''):
    _emit('subscription.upgraded', user_id=user_id, old_plan=old_plan, new_plan=new_plan, ip=ip)


def log_subscription_cancelled(user_id: int, plan: str, ip: str = ''):
    _emit('subscription.cancelled', user_id=user_id, plan=plan, ip=ip)


# ── Admin events ──────────────────────────────────────────────────

def log_user_status_changed(admin_id: int, target_user_id: int, new_status: str, ip: str):
    _emit('admin.user_status', admin_id=admin_id, target_user_id=target_user_id,
          new_status=new_status, ip=ip)


def log_user_deleted(admin_id: int, target_user_id: int, ip: str):
    _emit('admin.user_deleted', admin_id=admin_id, target_user_id=target_user_id, ip=ip)


# ── Security events ───────────────────────────────────────────────

def log_rate_limit_hit(ip: str, endpoint: str):
    _emit('security.rate_limit', ip=ip, endpoint=endpoint)


def log_suspicious_activity(ip: str, reason: str, endpoint: str = ''):
    _emit('security.suspicious', ip=ip, reason=reason, endpoint=endpoint)
