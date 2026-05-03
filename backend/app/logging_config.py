"""
app/logging_config.py
Structured JSON logging for OTPGuard.
- Development: human-readable colored output
- Production:  JSON lines (compatible with Datadog, CloudWatch, Loki)
"""
import os
import logging
import sys
from pythonjsonlogger import jsonlogger


# Fields that must NEVER appear in logs
_SENSITIVE = frozenset({
    'password', 'password_hash', 'pw_hash',
    'code', 'otp', 'otp_code', 'token',
    'access_token', 'refresh_token', 'pre_auth_token',
    'mfa_secret', 'secret', 'auth_token',
    'twilio_auth_token', 'at_api_key', 'mail_password',
})


class _SanitizingFilter(logging.Filter):
    """Strip sensitive keys from log records before they are emitted."""

    def filter(self, record):
        if hasattr(record, '__dict__'):
            for key in list(vars(record).keys()):
                if key.lower() in _SENSITIVE:
                    setattr(record, key, '[REDACTED]')
        # Also scrub 'extra' dicts passed to logger.info(..., extra={})
        if hasattr(record, 'extra') and isinstance(record.extra, dict):
            for k in list(record.extra.keys()):
                if k.lower() in _SENSITIVE:
                    record.extra[k] = '[REDACTED]'
        return True


class _JsonFormatter(jsonlogger.JsonFormatter):
    """Extend pythonjsonlogger to always include standard fields."""

    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record['level']   = record.levelname
        log_record['logger']  = record.name
        log_record['service'] = 'otpguard-api'
        # Remove raw levelname duplicate
        log_record.pop('levelname', None)


def setup_logging(app):
    """
    Configure structured logging on the Flask app.
    Call once inside create_app().
    """
    env       = os.getenv('FLASK_ENV', 'development')
    log_level = os.getenv('LOG_LEVEL', 'DEBUG' if env == 'development' else 'INFO').upper()

    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(_SanitizingFilter())

    if env == 'production':
        # JSON lines — one log event per line
        fmt = _JsonFormatter(
            fmt='%(asctime)s %(level)s %(logger)s %(message)s',
            datefmt='%Y-%m-%dT%H:%M:%S',
        )
    else:
        # Human-readable for local dev
        fmt = logging.Formatter(
            '[%(asctime)s] %(levelname)-8s %(name)s — %(message)s',
            datefmt='%H:%M:%S',
        )

    handler.setFormatter(fmt)

    # Root logger
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(log_level)

    # Quiet noisy third-party loggers
    for noisy in ('werkzeug', 'sqlalchemy.engine', 'urllib3', 'twilio'):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    # Attach to Flask app logger too
    app.logger.handlers.clear()
    app.logger.addHandler(handler)
    app.logger.setLevel(log_level)
    app.logger.propagate = False

    app.logger.info('Logging initialised', extra={'env': env, 'level': log_level})
