import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sanitizeInput, isValidEmail } from '../utils/sanitize'

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 8,
  background: 'var(--bg)', border: '1px solid var(--border)',
  color: 'var(--heading)', fontSize: '1rem', outline: 'none',
  transition: 'border-color .2s'
}

const planLabels = { starter: 'Starter (Free)', growth: 'Growth — KES 1,500/mo', business: 'Business — KES 5,000/mo' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [form, setForm]     = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', confirm_password: '', company: '',
    plan: params.get('plan') || 'starter'
  })
  const [showPw, setShowPw]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
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
        plan:      form.plan
      })
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: 700, color: 'var(--heading)' }}>
            OTP<span style={{ color: 'var(--green)' }}>Guard</span>
          </Link>
        </div>

        <div className="card">
          <h2 style={{ color: 'var(--heading)', marginBottom: 6 }}>Create your account</h2>
          <p style={{ fontSize: '.9rem', marginBottom: 28 }}>Start protecting your users today</p>

          {/* Selected plan badge */}
          {form.plan && (
            <div style={{
              background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ color: 'var(--green)', fontSize: '.85rem', fontWeight: 600 }}>
                ✓ Plan: {planLabels[form.plan] || form.plan}
              </span>
              <select value={form.plan} onChange={set('plan')} style={{
                background: 'transparent', border: 'none', color: 'var(--green)',
                fontSize: '.8rem', cursor: 'pointer', outline: 'none'
              }}>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="business">Business</option>
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>First Name</label>
                <input style={inputStyle} type="text" placeholder="John"
                  value={form.first_name} onChange={set('first_name')} required
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>Last Name</label>
                <input style={inputStyle} type="text" placeholder="Doe"
                  value={form.last_name} onChange={set('last_name')} required
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>Email</label>
              <input style={inputStyle} type="email" placeholder="you@company.com"
                value={form.email} onChange={set('email')} required
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>Mobile Number</label>
              <input style={inputStyle} type="tel" placeholder="+254700000000"
                value={form.phone} onChange={set('phone')}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle, paddingRight: 44 }} type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={form.password} onChange={set('password')} required
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)',
                  fontSize: '.8rem', padding: 0, lineHeight: 1,
                }}>{showPw ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{
                    ...inputStyle, paddingRight: 44,
                    borderColor: form.confirm_password && form.confirm_password !== form.password ? '#f87171' : undefined,
                  }}
                  type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password"
                  value={form.confirm_password} onChange={set('confirm_password')} required
                  onFocus={e => e.target.style.borderColor = form.confirm_password && form.confirm_password !== form.password ? '#f87171' : 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = form.confirm_password && form.confirm_password !== form.password ? '#f87171' : 'var(--border)'}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)',
                  fontSize: '.8rem', padding: 0, lineHeight: 1,
                }}>{showConfirm ? 'Hide' : 'Show'}</button>
              </div>
              {form.confirm_password && form.confirm_password !== form.password && (
                <div style={{ fontSize: '.75rem', color: '#f87171', marginTop: 4 }}>Passwords do not match</div>
              )}
              {form.confirm_password && form.confirm_password === form.password && (
                <div style={{ fontSize: '.75rem', color: 'var(--green)', marginTop: 4 }}>✓ Passwords match</div>
              )}
            </div>

            <div>
              <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>Company (optional)</label>
              <input style={inputStyle} type="text" placeholder="Your company name"
                value={form.company} onChange={set('company')}
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
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.85rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--green)' }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '.78rem', opacity: .5 }}>
          By signing up you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  )
}

