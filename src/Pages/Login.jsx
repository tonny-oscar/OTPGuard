import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 8,
  background: '#0a0e1a', border: '1px solid var(--border)',
  color: 'var(--heading)', fontSize: '1rem', outline: 'none',
  transition: 'border-color .2s'
}

export default function Login() {
  const { login, sendOTP, verifyOTP, resendOTP } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]         = useState('login')   // login | otp
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp]           = useState('')
  const [mfaMethod, setMfaMethod] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  async function handleResend() {
    setError(''); setLoading(true)
    try {
      await resendOTP()
      setResendTimer(60)  // 60 second cooldown
      setError('')  // Clear any previous errors
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const data = await login(identifier, password)
      if (data.mfa_required) {
        setMfaMethod(data.mfa_method)
        if (data.mfa_method !== 'totp') {
          await sendOTP()
          setResendTimer(60)  // 60 second cooldown before first resend
        }
        setStep('otp')
      } else {
        navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const data = await verifyOTP(otp)
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: 700, color: 'var(--heading)' }}>
            🔐 OTP<span style={{ color: 'var(--green)' }}>Guard</span>
          </Link>
        </div>

        <div className="card">
          {step === 'login' ? (
            <>
              <h2 style={{ color: 'var(--heading)', marginBottom: 6 }}>Welcome back</h2>
              <p style={{ fontSize: '.9rem', marginBottom: 28 }}>Sign in to your account</p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>Email or mobile number</label>
                  <input style={inputStyle} type="text" placeholder="you@example.com or +254700000000"
                    value={identifier} onChange={e => setIdentifier(e.target.value)} required
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>Password</label>
                  <input style={inputStyle} type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                {error && (
                  <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: '.85rem' }}>
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.85rem' }}>
                No account? <Link to="/register" style={{ color: 'var(--green)' }}>Sign up free</Link>
              </p>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>
                  {mfaMethod === 'sms' ? '📱' : mfaMethod === 'totp' ? '🔑' : '📧'}
                </div>
                <h2 style={{ color: 'var(--heading)', marginBottom: 8 }}>
                  {mfaMethod === 'totp' ? 'Authenticator Code' : 'Enter OTP'}
                </h2>
                <p style={{ fontSize: '.9rem' }}>
                  {mfaMethod === 'totp'
                    ? 'Enter the 6-digit code from your authenticator app'
                    : `Code sent to your ${mfaMethod === 'sms' ? 'phone' : 'email'}`}
                </p>
              </div>

              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '1.8rem', letterSpacing: 10, fontFamily: 'monospace' }}
                  type="text" maxLength={6} placeholder="000000"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  autoFocus
                />

                {error && (
                  <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: '.85rem', textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading || otp.length < 6}>
                  {loading ? 'Verifying...' : 'Verify Code →'}
                </button>

                <div style={{ textAlign: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '.85rem', marginBottom: 12, color: 'var(--text)' }}>
                    Didn't receive the code?
                  </p>
                  <button 
                    type="button" 
                    onClick={handleResend}
                    disabled={resendTimer > 0 || loading}
                    style={{ 
                      background: 'none', 
                      border: '1px solid var(--green)', 
                      color: 'var(--green)', 
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', 
                      padding: '8px 16px',
                      borderRadius: 6,
                      fontSize: '.85rem',
                      opacity: resendTimer > 0 ? 0.5 : 1
                    }}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <button type="button" onClick={() => { setStep('login'); setOtp(''); setError(''); setResendTimer(0) }}
                  style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '.85rem', marginTop: 12 }}>
                  ← Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
