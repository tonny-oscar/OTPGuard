/**
 * OTPGuard JavaScript SDK v1.0.0
 * https://otpguard.onrender.com
 */

class OTPGuardError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'OTPGuardError'
    this.code = code
    this.status = status
  }
}

class OTPGuard {
  /**
   * @param {string} apiKey - Your OTPGuard API key (otpg_...)
   * @param {object} [options]
   * @param {string} [options.baseUrl]
   * @param {number} [options.timeout] - ms, default 10000
   * @param {number} [options.retries] - default 2
   */
  constructor(apiKey, options = {}) {
    if (!apiKey) throw new OTPGuardError('API key is required', 'MISSING_API_KEY', 0)
    this.apiKey  = apiKey
    this.baseUrl = (options.baseUrl || 'https://otpguard.onrender.com/api').replace(/\/$/, '')
    this.timeout = options.timeout ?? 10000
    this.retries = options.retries ?? 2
  }

  async _request(method, path, body, attempt = 0) {
    const ctrl  = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), this.timeout)
    try {
      const res  = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-API-Key': this.apiKey },
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      })
      const data = await res.json()
      if (!res.ok) throw new OTPGuardError(data.error || 'Request failed', data.code || 'API_ERROR', res.status)
      return data
    } catch (err) {
      if (err instanceof OTPGuardError) {
        if (err.status >= 500 && attempt < this.retries) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
          return this._request(method, path, body, attempt + 1)
        }
        throw err
      }
      if (err.name === 'AbortError') throw new OTPGuardError('Request timed out', 'TIMEOUT', 0)
      throw new OTPGuardError(err.message, 'NETWORK_ERROR', 0)
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Send OTP via SMS or Email
   * @param {'sms'|'email'} method
   * @param {string} [phone]  - required for sms
   * @param {string} [email]  - required for email
   */
  sendOTP({ method, phone, email }) {
    if (!method) throw new OTPGuardError('method is required', 'VALIDATION_ERROR', 0)
    if (method === 'sms'   && !phone)  throw new OTPGuardError('phone is required for SMS',   'VALIDATION_ERROR', 0)
    if (method === 'email' && !email)  throw new OTPGuardError('email is required for email', 'VALIDATION_ERROR', 0)
    return this._request('POST', '/mfa/otp/send', { method, phone, email })
  }

  /**
   * Verify OTP code
   * @param {'sms'|'email'} method
   * @param {string} code
   * @param {string} [phone]
   * @param {string} [email]
   */
  verifyOTP({ method, code, phone, email }) {
    if (!code) throw new OTPGuardError('code is required', 'VALIDATION_ERROR', 0)
    return this._request('POST', '/mfa/otp/verify', { method, code, phone, email })
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OTPGuard, OTPGuardError }
} else {
  window.OTPGuard = OTPGuard
}
