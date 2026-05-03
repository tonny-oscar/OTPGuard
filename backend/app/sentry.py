"""
app/sentry.py
Sentry error monitoring integration.
Only activates when SENTRY_DSN env var is set.
Scrubs sensitive fields before events are sent to Sentry.
"""
import os
import logging

logger = logging.getLogger(__name__)

_SCRUB_KEYS = {
    'password', 'password_hash', 'pw_hash',
    'code', 'otp', 'token', 'access_token', 'refresh_token',
    'pre_auth_token', 'mfa_secret', 'secret',
    'authorization', 'x-api-key', 'cookie',
    'twilio_auth_token', 'at_api_key', 'mail_password',
}


def _before_send(event, hint):
    """Scrub sensitive data before sending to Sentry."""
    def _scrub(obj):
        if isinstance(obj, dict):
            return {
                k: '[REDACTED]' if k.lower() in _SCRUB_KEYS else _scrub(v)
                for k, v in obj.items()
            }
        if isinstance(obj, list):
            return [_scrub(i) for i in obj]
        return obj

    # Scrub request data
    if 'request' in event:
        event['request'] = _scrub(event['request'])

    # Scrub extra context
    if 'extra' in event:
        event['extra'] = _scrub(event['extra'])

    return event


def init_sentry(app):
    """
    Initialise Sentry SDK if SENTRY_DSN is configured.
    Safe to call even when DSN is absent — does nothing.
    """
    dsn = os.getenv('SENTRY_DSN', '').strip()
    if not dsn:
        logger.info('Sentry not configured (SENTRY_DSN not set)')
        return

    try:
        import sentry_sdk
        from sentry_sdk.integrations.flask       import FlaskIntegration
        from sentry_sdk.integrations.sqlalchemy  import SqlalchemyIntegration
        from sentry_sdk.integrations.logging     import LoggingIntegration

        env         = os.getenv('FLASK_ENV', 'development')
        release     = os.getenv('APP_VERSION', 'unknown')
        sample_rate = float(os.getenv('SENTRY_TRACES_SAMPLE_RATE', '0.1'))

        sentry_sdk.init(
            dsn=dsn,
            environment=env,
            release=release,
            integrations=[
                FlaskIntegration(transaction_style='url'),
                SqlalchemyIntegration(),
                # Only capture ERROR+ from logging — not DEBUG/INFO noise
                LoggingIntegration(level=logging.ERROR, event_level=logging.ERROR),
            ],
            # Performance tracing — 10% of requests in prod
            traces_sample_rate=sample_rate if env == 'production' else 0.0,
            # Strip PII automatically
            send_default_pii=False,
            before_send=_before_send,
            # Ignore common non-actionable errors
            ignore_errors=[KeyboardInterrupt, SystemExit],
        )

        logger.info('Sentry initialised', extra={'env': env, 'release': release})

    except ImportError:
        logger.warning('sentry-sdk not installed — skipping Sentry init')
    except Exception as e:
        logger.error(f'Sentry init failed: {e}')
