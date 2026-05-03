import re
import requests

try:
    import bleach
    _BLEACH = True
except ImportError:
    _BLEACH = False


def get_client_ip(request) -> str:
    """Get real client IP, respecting X-Forwarded-For from proxies."""
    forwarded = request.headers.get('X-Forwarded-For')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.remote_addr or 'unknown'


def get_location(ip: str) -> str:
    """Resolve IP to city, country using ip-api.com (free, no key needed)."""
    if not ip or ip in ('127.0.0.1', '::1', 'unknown'):
        return 'Local'
    try:
        resp = requests.get(
            f'http://ip-api.com/json/{ip}?fields=city,country', timeout=3
        )
        data    = resp.json()
        city    = data.get('city', '')
        country = data.get('country', '')
        return f'{city}, {country}'.strip(', ') or 'Unknown'
    except Exception:
        return 'Unknown'


# ── Input sanitization ────────────────────────────────────────────

def sanitize_str(value, max_length=255):
    """Strip all HTML/script tags and truncate."""
    if not isinstance(value, str):
        return ''
    if _BLEACH:
        cleaned = bleach.clean(value, tags=[], attributes={}, strip=True)
    else:
        cleaned = re.sub(r'<[^>]+>', '', value)
    return cleaned.strip()[:max_length]


def sanitize_email(value):
    """Lowercase, strip whitespace, validate basic format."""
    if not isinstance(value, str):
        return ''
    v = value.strip().lower()[:254]
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', v):
        return ''
    return v


def sanitize_phone(value):
    """Keep only +, digits, spaces, dashes."""
    if not isinstance(value, str):
        return ''
    return re.sub(r'[^\d\+\-\s]', '', value.strip())[:20]
