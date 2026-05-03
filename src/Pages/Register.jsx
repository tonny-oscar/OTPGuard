import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sanitizeInput, isValidEmail } from '../utils/sanitize'
import sideBg from '../assets/pexels-apex-360-1742295-4040962.jpg'
import sideBg2 from '../assets/pexels-severus-jones-942216-4304021.jpg'
import logo from '../assets/logo.png'

const inp = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
  color: '#f1f5f9', fontSize: '.92rem', outline: 'none', transition: 'border-color .2s, background .2s',
}

const planLabels = { starter: 'Starter (Free)', growth: 'Growth — KES 1,500/mo', business: 'Business — KES 5,000/mo' }

const features = [
  'SMS, Email & Authenticator OTP',
  'Real-time admin dashboard',
  'Device trust & location tracking',
  'GDPR-ready audit trail',
  'Up and running in under an hour',
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', confirm_password: '', company: '',
    plan: params.get('plan') || 'starter'
  })
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault(); setError('')
    const cleanEmail = sanitizeInput(form.email, 254)
    if (!isValidEmail(cleanEmail)) return setError('Please enter a valid email address')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    if (form.password !== form.confirm_password) return setError('Passwords do not match')
    setLoading(true)
    try {
      const data = await register({
        email:     cleanEmail.trim().toLowerCase(),
        password:  form.password,
        full_name: sanitizeInput(`${form.first_name} ${form.last_name}`.trim(), 120),
        phone:     sanitizeInput(form.phone, 20),
        company:   sanitizeInput(form.company, 100),
        plan:      form.plan,
      })
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const focusStyle = (e) => { e.target.style.borderColor = '#00ff88'; e.target.style.background = 'rgba(0,255,136,.06)' }
  const blurStyle  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.background = 'rgba(255,255,255,.06)' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0e1a' }}>

      {/* LEFT — image panel */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'none' }} className="reg-img-panel">
        {/* Two images stacked with blend */}
        <img src={sideBg} alt="" style={{ width: '100%', height: '60%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
        <img src={sideBg2} alt="" style={{ width: '100%', height: '50%', objectFit: 'cover', position: 'absolute', bottom: 0, left: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,26,.6) 0%, rgba(10,14,26,.5) 50%, rgba(10,14,26,.8) 100%)' }} />

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
            <h2 style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.25, marginBottom: 20 }}>
              Join 50+ businesses<br />protecting their users
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,255,136,.15)', border: '1px solid rgba(0,255,136,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#00ff88', fontSize: '.65rem', fontWeight: 800 }}>+</span>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '.9rem' }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 36, padding: '20px', background: 'rgba(0,255,136,.06)', border: '1px solid rgba(0,255,136,.15)', borderRadius: 12 }}>
              <p style={{ color: '#94a3b8', fontSize: '.85rem', lineHeight: 1.7, fontStyle: 'italic' }}>
                "We integrated OTPGuard in a single afternoon. Our fraud rate dropped by over 80% in the first month."
              </p>
              <div style={{ marginTop: 10, fontSize: '.78rem', color: '#00ff88', fontWeight: 600 }}>James Mwangi — CTO, FinPay Kenya</div>
            </div>
          </div>

          <p style={{ fontSize: '.75rem', color: '#334155' }}>© {new Date().getFullYear()} OTPGuard. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{
        width: '100%', maxWidth: 520,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '32px 40px', background: '#0d1117', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, rgba(0,255,136,.18), rgba(0,255,136,.06))', border: '1px solid rgba(0,255,136,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 0 10px rgba(0,255,136,.15)' }}>
                <img src={logo} alt="OTPGuard" style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 5 }} />
              </div>
              <div style={{ lineHeight: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f1f5f9', letterSpacing: '-.02em' }}>OTP<span style={{ color: '#00ff88' }}>Guard</span></div>
                <div style={{ fontSize: '.52rem', color: 'rgba(0,255,136,.55)', fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', marginTop: 1 }}>MFA Platform</div>
              </div>
            </Link>
            <Link to="/login" style={{ fontSize: '.82rem', color: '#64748b', textDecoration: 'none' }}>
              Have an account? <span style={{ color: '#00ff88', fontWeight: 600 }}>Sign in</span>
            </Link>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4, letterSpacing: '-.02em' }}>Create your account</h1>
            <p style={{ color: '#64748b', fontSize: '.88rem' }}>Start protecting your users today. Free forever on Starter.</p>
          </div>

          {/* Plan badge */}
          <div style={{ background: 'rgba(0,255,136,.08)', border: '1px solid rgba(0,255,136,.2)', borderRadius: 8, padding: '9px 14px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#00ff88', fontSize: '.82rem', fontWeight: 600 }}>Plan: {planLabels[form.plan] || form.plan}</span>
            <select value={form.plan} onChange={set('plan')} style={{ background: 'transparent', border: 'none', color: '#00ff88', fontSize: '.78rem', cursor: 'pointer', outline: 'none' }}>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="business">Business</option>
            </select>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>First Name</label>
                <input style={inp} type="text" placeholder="John" value={form.first_name} onChange={set('first_name')} required onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>Last Name</label>
                <input style={inp} type="text" placeholder="Doe" value={form.last_name} onChange={set('last_name')} required onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>Email</label>
              <input style={inp} type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>Mobile Number</label>
              <input style={inp} type="tel" placeholder="+254700000000" value={form.phone} onChange={set('phone')} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inp, paddingRight: 48 }} type={showPw ? 'text' : 'password'} placeholder="Min. 8 chars" value={form.password} onChange={set('password')} required onFocus={focusStyle} onBlur={blurStyle} />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '.7rem', fontWeight: 600 }}>{showPw ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>Confirm</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inp, paddingRight: 48, borderColor: form.confirm_password && form.confirm_password !== form.password ? '#f87171' : undefined }}
                    type={showConfirm ? 'text' : 'password'} placeholder="Re-enter" value={form.confirm_password} onChange={set('confirm_password')} required
                    onFocus={e => { e.target.style.borderColor = form.confirm_password !== form.password ? '#f87171' : '#00ff88'; e.target.style.background = 'rgba(0,255,136,.06)' }}
                    onBlur={e => { e.target.style.borderColor = form.confirm_password && form.confirm_password !== form.password ? '#f87171' : 'rgba(255,255,255,.12)'; e.target.style.background = 'rgba(255,255,255,.06)' }}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '.7rem', fontWeight: 600 }}>{showConfirm ? 'Hide' : 'Show'}</button>
                </div>
                {form.confirm_password && form.confirm_password !== form.password && <div style={{ fontSize: '.7rem', color: '#f87171', marginTop: 3 }}>No match</div>}
                {form.confirm_password && form.confirm_password === form.password && <div style={{ fontSize: '.7rem', color: '#00ff88', marginTop: 3 }}>Match</div>}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>Company (optional)</label>
              <input style={inp} type="text" placeholder="Your company name" value={form.company} onChange={set('company')} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 8, padding: '9px 13px', color: '#f87171', fontSize: '.82rem' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: '13px', borderRadius: 10, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(0,255,136,.4)' : 'linear-gradient(135deg, #00ff88, #00cc6a)',
              color: '#0a0e1a', fontWeight: 800, fontSize: '1rem', width: '100%', transition: 'all .2s',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: '.75rem', color: '#334155' }}>
            By signing up you agree to our{' '}
            <Link to="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</Link> &amp;{' '}
            <Link to="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .reg-img-panel { display: flex !important; } }
      `}</style>
    </div>
  )
}
