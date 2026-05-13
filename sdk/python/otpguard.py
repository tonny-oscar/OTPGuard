"""
OTPGuard Python SDK v1.0.0
Official SDK for the OTPGuard MFA Platform
"""
import time
import requests
from typing import Optional


class OTPGuardError(Exception):
    def __init__(self, message: str, code: str = "API_ERROR", status: int = 0):
        super().__init__(message)
        self.code   = code
        self.status = status

    def __repr__(self):
        return f"OTPGuardError(message={str(self)!r}, code={self.code!r}, status={self.status})"


class OTPGuard:
    """
    OTPGuard Python SDK

    Usage:
        from otpguard import OTPGuard, OTPGuardError

        client = OTPGuard("otpg_your_api_key")

        # Send OTP
        result = client.send_otp(method="email", email="user@example.com")
        print(result["otp_id"])

        # Verify OTP
        result = client.verify_otp(method="email", email="user@example.com", code="123456")
        print(result["verified"])
    """

    BASE_URL = "https://otpguard.onrender.com/api"

    def __init__(
        self,
        api_key: str,
        base_url: Optional[str] = None,
        timeout: int = 10,
        retries: int = 2,
    ):
        if not api_key:
            raise OTPGuardError("API key is required", "MISSING_API_KEY")
        self.api_key  = api_key
        self.base_url = (base_url or self.BASE_URL).rstrip("/")
        self.timeout  = timeout
        self.retries  = retries
        self._session = requests.Session()
        self._session.headers.update({
            "X-API-Key":    api_key,
            "Content-Type": "application/json",
            "Accept":       "application/json",
        })

    def _request(self, method: str, path: str, body: Optional[dict] = None, attempt: int = 0) -> dict:
        url = f"{self.base_url}{path}"
        try:
            resp = self._session.request(method, url, json=body, timeout=self.timeout)
            data = resp.json()
            if not resp.ok:
                raise OTPGuardError(
                    data.get("error", "Request failed"),
                    data.get("code", "API_ERROR"),
                    resp.status_code,
                )
            return data
        except OTPGuardError:
            raise
        except requests.exceptions.Timeout:
            raise OTPGuardError("Request timed out", "TIMEOUT")
        except requests.exceptions.ConnectionError as e:
            if attempt < self.retries:
                time.sleep(0.5 * (attempt + 1))
                return self._request(method, path, body, attempt + 1)
            raise OTPGuardError(str(e), "NETWORK_ERROR")
        except Exception as e:
            raise OTPGuardError(str(e), "UNKNOWN_ERROR")

    def send_otp(
        self,
        method: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
    ) -> dict:
        """
        Send an OTP via SMS or Email.

        Args:
            method: 'sms' or 'email'
            phone:  Phone number in E.164 format (required for SMS)
            email:  Email address (required for email)

        Returns:
            dict with keys: message, otp_id, expires_in
        """
        if method not in ("sms", "email"):
            raise OTPGuardError("method must be 'sms' or 'email'", "VALIDATION_ERROR")
        if method == "sms" and not phone:
            raise OTPGuardError("phone is required for SMS", "VALIDATION_ERROR")
        if method == "email" and not email:
            raise OTPGuardError("email is required for email OTP", "VALIDATION_ERROR")
        return self._request("POST", "/mfa/otp/send", {"method": method, "phone": phone, "email": email})

    def verify_otp(
        self,
        method: str,
        code: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
    ) -> dict:
        """
        Verify an OTP code.

        Args:
            method: 'sms' or 'email'
            code:   The OTP code entered by the user
            phone:  Phone number (for SMS)
            email:  Email address (for email)

        Returns:
            dict with keys: verified, message
        """
        if not code:
            raise OTPGuardError("code is required", "VALIDATION_ERROR")
        return self._request("POST", "/mfa/otp/verify", {
            "method": method, "code": code, "phone": phone, "email": email
        })

    def close(self):
        self._session.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
