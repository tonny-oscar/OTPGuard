import requests


def get_client_ip(request) -> str:
    """Get real client IP, respecting X-Forwarded-For from proxies."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def get_location(ip: str) -> str:
    """Resolve IP to city, country using ip-api.com (free, no key needed)."""
    if not ip or ip in ("127.0.0.1", "::1", "unknown"):
        return "Local"
    try:
        resp = requests.get(f"http://ip-api.com/json/{ip}?fields=city,country", timeout=3)
        data = resp.json()
        city    = data.get("city", "")
        country = data.get("country", "")
        return f"{city}, {country}".strip(", ") or "Unknown"
    except Exception:
        return "Unknown"
