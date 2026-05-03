import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sanitizeInput, isValidEmail } from '../utils/sanitize'
import loginBg from '../assets/pexels-padrinan-2882566.jpg'
import sideBg from '../assets/pexels-dan-nelson-1667453-4973899.jpg'
import logo from '../assets/logo.png'

const inp = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
  color: '#f1f5f9', fontSize: '.95rem', outline: 'none', transition: 'border-color .2s, background .2s',
}

export default function Login() {
  const { login, sendOTP, verifyOTP, resendOTP } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]             = useState('login')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [otp, setOtp]               = useState('')
  const [mfaMethod, setMfaMethod]   = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  async function handleResend() {
    setError(''); setLoading(true)
    try { await resendOTP(); setResendTimer(60) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleLogin(e) {
    e.preventDefault(); setError(''); setLoading(true)
    const cleanId = sanitizeInput(identifier, 254)
    if (!cleanId) { setLoading(false); return setError('Please enter your email or phone') }
    try {
      const data = await login(cleanId, password)
      if (data.mfa_required) {
        setMfaMethod(data.mfa_method)
        if (data.mfa_method !== 'totp') { await sendOTP(); setResendTimer(60) }
        setStep('otp')
      } else {
        navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard')
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleVerify(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const data = await verifyOTP(otp)
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0e1a' }}>

      {/* LEFT — image panel */}
      <div style={{
        flex: 1, position: 'relative', display: 'none',
        overflow: 'hidden',
      }} className="login-img-panel">
        <img src={sideBg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        {/* dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,.7) 0%, rgba(10,14,26,.85) 100%)' }} />
        {/* content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg, rgba(0,255,136,.18), rgba(0,255,136,.06))', border: '1px solid rgba(0,255,136,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={logo} alt="OTPGuard" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 5 }} />
            </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f1f5f9', letterSpacing: '-.02em' }}>OTP<span style={{ color: '#00ff88' }}>Guard</span></div>
              <div style={{ fontSize: '.54rem', color: 'rgba(0,255,136,.55)', fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', marginTop: 1 }}>MFA Platform</div>
            </div>
          </Link>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 4, background: '#00ff88', borderRadius: 2, marginBottom: 24 }} />
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 16 }}>
              Secure every login.<br />Trust every user.
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '1rem', maxWidth: 360 }}>
              OTPGuard protects your application with multi-factor authentication — SMS, email, and authenticator app support in one platform.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
              {[{ val: '99.9%', label: 'Uptime' }, { val: '< 3s', label: 'OTP Delivery' }, { val: '50+', label: 'Businesses' }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00ff88' }}>{s.val}</div>
                  <div style={{ fontSize: '.75rem', color: '#64748b', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: '.75rem', color: '#475569' }}>© {new Date().getFullYear()} OTPGuard. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '40px 40px',
        position: 'relative', overflow: 'hidden',
        background: '#0d1117',
      }}>
        {/* background texture from image — subtle */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${loginBg})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: .04, pointerEvents: 'none',
        }} />
        {/* green glow top-right */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* blue glow bottom-left */}
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Mobile logo */}
          <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, rgba(0,255,136,.18), rgba(0,255,136,.06))', border: '1px solid rgba(0,255,136,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 0 10px rgba(0,255,136,.15)' }}>
                <img src={logo} alt="OTPGuard" style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 5 }} />
              </div>
              <div style={{ lineHeight: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f1f5f9', letterSpacing: '-.02em' }}>OTP<span style={{ color: '#00ff88' }}>Guard</span></div>
                <div style={{ fontSize: '.52rem', color: 'rgba(0,255,136,.55)', fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', marginTop: 1 }}>MFA Platform</div>
              </div>
            </Link>
            <Link to="/register" style={{ fontSize: '.82rem', color: '#64748b', textDecoration: 'none' }}>
              No account? <span style={{ color: '#00ff88', fontWeight: 600 }}>Sign up</span>
            </Link>
          </div>

          {step === 'login' ? (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-.02em' }}>Welcome back</h1>
                <p style={{ color: '#64748b', fontSize: '.9rem' }}>Sign in to your OTPGuard account</p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .6 }}>Email or Phone</label>
                  <input style={inp} type="text" placeholder="you@example.com or +254700000000"
                    value={identifier} onChange={e => setIdentifier(e.target.value)} required
                    onFocus={e => { e.target.style.borderColor = '#00ff88'; e.target.style.background = 'rgba(0,255,136,.06)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.background = 'rgba(255,255,255,.06)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .6 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inp, paddingRight: 52 }} type={showPw ? 'text' : 'password'} placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)} required
                      onFocus={e => { e.target.style.borderColor = '#00ff88'; e.target.style.background = 'rgba(0,255,136,.06)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.background = 'rgba(255,255,255,.06)' }}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '.75rem', fontWeight: 600,
                    }}>{showPw ? 'Hide' : 'Show'}</button>
                  </div>
                </div>

                {error && (
                  <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: '.83rem' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  marginTop: 6, padding: '13px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'rgba(0,255,136,.4)' : 'linear-gradient(135deg, #00ff88, #00cc6a)',
                  color: '#0a0e1a', fontWeight: 800, fontSize: '1rem', letterSpacing: '.01em',
                  transition: 'opacity .2s, transform .15s', width: '100%',
                }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '.83rem', color: '#475569' }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: '#00ff88', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, rgba(0,255,136,.2), rgba(0,255,136,.05))',
                  border: '2px solid rgba(0,255,136,.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.75rem', fontWeight: 800, color: '#00ff88', letterSpacing: .5,
                }}>
                  {mfaMethod === 'sms' ? 'SMS' : mfaMethod === 'totp' ? 'TOTP' : 'OTP'}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
                  {mfaMethod === 'totp' ? 'Authenticator Code' : 'Verify Your Identity'}
                </h2>
                <p style={{ fontSize: '.88rem', color: '#64748b' }}>
                  {mfaMethod === 'totp' ? 'Enter the 6-digit code from your authenticator app' : `Code sent to your ${mfaMethod === 'sms' ? 'phone' : 'email'}`}
                </p>
              </div>

              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  style={{ ...inp, textAlign: 'center', fontSize: '2rem', letterSpacing: 14, fontFamily: 'monospace', padding: '16px' }}
                  type="text" maxLength={6} placeholder="000000"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onFocus={e => { e.target.style.borderColor = '#00ff88'; e.target.style.background = 'rgba(0,255,136,.06)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.background = 'rgba(255,255,255,.06)' }}
                  autoFocus
                />

                {error && (
                  <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: '.83rem', textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || otp.length < 6} style={{
                  padding: '13px', borderRadius: 10, border: 'none',
                  cursor: loading || otp.length < 6 ? 'not-allowed' : 'pointer',
                  background: otp.length < 6 ? 'rgba(0,255,136,.25)' : 'linear-gradient(135deg, #00ff88, #00cc6a)',
                  color: '#0a0e1a', fontWeight: 800, fontSize: '1rem', width: '100%',
                  transition: 'all .2s',
                }}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div style={{ textAlign: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <p style={{ fontSize: '.83rem', color: '#475569', marginBottom: 10 }}>Didn't receive the code?</p>
                  <button type="button" onClick={handleResend} disabled={resendTimer > 0 || loading} style={{
                    background: 'none', border: '1px solid rgba(0,255,136,.3)', color: '#00ff88',
                    cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                    padding: '7px 18px', borderRadius: 8, fontSize: '.83rem', fontWeight: 600,
                    opacity: resendTimer > 0 ? .5 : 1, transition: 'all .2s',
                  }}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <button type="button" onClick={() => { setStep('login'); setOtp(''); setError(''); setResendTimer(0) }}
                  style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '.83rem', marginTop: 4 }}>
                  ← Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .login-img-panel { display: flex !important; } }
      `}</style>
    </div>
  )
}
