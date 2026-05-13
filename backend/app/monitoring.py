"""
app/monitoring.py
Monitoring & Alerting Service
Sends alerts to Slack, Discord, PagerDuty when critical events occur
"""
import requests
import logging
from datetime import datetime, timezone
from flask import current_app

logger = logging.getLogger(__name__)


class MonitoringService:
    """Centralized monitoring and alerting service."""

    @staticmethod
    def send_alert(title: str, message: str, severity: str = 'info', metadata: dict = None):
        """
        Send alert to all configured channels.
        
        Args:
            title: Alert title
            message: Alert message
            severity: info | warning | error | critical
            metadata: Additional context data
        """
        cfg = current_app.config
        metadata = metadata or {}
        
        # Slack
        if cfg.get('SLACK_WEBHOOK_URL'):
            try:
                MonitoringService._send_slack(title, message, severity, metadata)
            except Exception as e:
                logger.error(f"[MONITORING] Slack alert failed: {e}")
        
        # Discord
        if cfg.get('DISCORD_WEBHOOK_URL'):
            try:
                MonitoringService._send_discord(title, message, severity, metadata)
            except Exception as e:
                logger.error(f"[MONITORING] Discord alert failed: {e}")
        
        # PagerDuty
        if cfg.get('PAGERDUTY_INTEGRATION_KEY') and severity in ('error', 'critical'):
            try:
                MonitoringService._send_pagerduty(title, message, severity, metadata)
            except Exception as e:
                logger.error(f"[MONITORING] PagerDuty alert failed: {e}")
        
        # Always log
        log_level = {
            'info': logging.INFO,
            'warning': logging.WARNING,
            'error': logging.ERROR,
            'critical': logging.CRITICAL
        }.get(severity, logging.INFO)
        
        logger.log(log_level, f"[ALERT] {title}: {message}", extra=metadata)

    @staticmethod
    def _send_slack(title: str, message: str, severity: str, metadata: dict):
        """Send alert to Slack."""
        color_map = {
            'info': '#36a64f',
            'warning': '#ff9800',
            'error': '#f44336',
            'critical': '#9c27b0'
        }
        
        payload = {
            "attachments": [{
                "color": color_map.get(severity, '#36a64f'),
                "title": f"🚨 {title}",
                "text": message,
                "fields": [
                    {"title": "Severity", "value": severity.upper(), "short": True},
                    {"title": "Time", "value": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC'), "short": True}
                ] + [
                    {"title": k, "value": str(v), "short": True}
                    for k, v in metadata.items()
                ],
                "footer": "OTPGuard Monitoring",
                "ts": int(datetime.now(timezone.utc).timestamp())
            }]
        }
        
        resp = requests.post(
            current_app.config['SLACK_WEBHOOK_URL'],
            json=payload,
            timeout=5
        )
        resp.raise_for_status()
        logger.info(f"[SLACK] Alert sent: {title}")

    @staticmethod
    def _send_discord(title: str, message: str, severity: str, metadata: dict):
        """Send alert to Discord."""
        color_map = {
            'info': 3447003,      # Blue
            'warning': 16776960,  # Yellow
            'error': 15158332,    # Red
            'critical': 10181046  # Purple
        }
        
        embed = {
            "title": f"🚨 {title}",
            "description": message,
            "color": color_map.get(severity, 3447003),
            "fields": [
                {"name": "Severity", "value": severity.upper(), "inline": True},
                {"name": "Time", "value": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC'), "inline": True}
            ] + [
                {"name": k, "value": str(v), "inline": True}
                for k, v in metadata.items()
            ],
            "footer": {"text": "OTPGuard Monitoring"},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        payload = {"embeds": [embed]}
        
        resp = requests.post(
            current_app.config['DISCORD_WEBHOOK_URL'],
            json=payload,
            timeout=5
        )
        resp.raise_for_status()
        logger.info(f"[DISCORD] Alert sent: {title}")

    @staticmethod
    def _send_pagerduty(title: str, message: str, severity: str, metadata: dict):
        """Send alert to PagerDuty."""
        payload = {
            "routing_key": current_app.config['PAGERDUTY_INTEGRATION_KEY'],
            "event_action": "trigger",
            "payload": {
                "summary": f"{title}: {message}",
                "severity": severity,
                "source": "otpguard-api",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "custom_details": metadata
            }
        }
        
        resp = requests.post(
            "https://events.pagerduty.com/v2/enqueue",
            json=payload,
            timeout=5
        )
        resp.raise_for_status()
        logger.info(f"[PAGERDUTY] Alert sent: {title}")

    @staticmethod
    def alert_high_error_rate(error_count: int, total_requests: int, threshold: float = 0.05):
        """Alert when error rate exceeds threshold."""
        error_rate = error_count / total_requests if total_requests > 0 else 0
        if error_rate > threshold:
            MonitoringService.send_alert(
                title="High Error Rate Detected",
                message=f"Error rate is {error_rate*100:.1f}% ({error_count}/{total_requests} requests failed)",
                severity='error',
                metadata={
                    'error_count': error_count,
                    'total_requests': total_requests,
                    'error_rate': f"{error_rate*100:.1f}%",
                    'threshold': f"{threshold*100:.1f}%"
                }
            )

    @staticmethod
    def alert_database_slow(query_time_ms: float, threshold_ms: float = 1000):
        """Alert when database queries are slow."""
        if query_time_ms > threshold_ms:
            MonitoringService.send_alert(
                title="Slow Database Query",
                message=f"Query took {query_time_ms:.0f}ms (threshold: {threshold_ms:.0f}ms)",
                severity='warning',
                metadata={
                    'query_time_ms': query_time_ms,
                    'threshold_ms': threshold_ms
                }
            )

    @staticmethod
    def alert_sms_delivery_failure(phone: str, provider: str, error: str):
        """Alert when SMS delivery fails."""
        MonitoringService.send_alert(
            title="SMS Delivery Failure",
            message=f"Failed to send SMS to {phone} via {provider}",
            severity='error',
            metadata={
                'phone': phone,
                'provider': provider,
                'error': error
            }
        )

    @staticmethod
    def alert_email_delivery_failure(email: str, error: str):
        """Alert when email delivery fails."""
        MonitoringService.send_alert(
            title="Email Delivery Failure",
            message=f"Failed to send email to {email}",
            severity='error',
            metadata={
                'email': email,
                'error': error
            }
        )

    @staticmethod
    def alert_suspicious_activity(ip: str, failed_attempts: int, user_email: str = None):
        """Alert on suspicious login activity."""
        MonitoringService.send_alert(
            title="Suspicious Activity Detected",
            message=f"IP {ip} has {failed_attempts} failed login attempts",
            severity='warning',
            metadata={
                'ip': ip,
                'failed_attempts': failed_attempts,
                'user_email': user_email or 'N/A'
            }
        )

    @staticmethod
    def alert_service_down(service_name: str, error: str):
        """Alert when a critical service is down."""
        MonitoringService.send_alert(
            title=f"Service Down: {service_name}",
            message=f"{service_name} is not responding",
            severity='critical',
            metadata={
                'service': service_name,
                'error': error
            }
        )
