import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 8,
  background: '#0a0e1a', border: '1px solid var(--border)',
  color: 'var(--heading)', fontSize: '1rem', outline: 'none',
  transition: 'border-color .2s'
}

const planLabels = { starter: 'Starter (Free)', growth: 'Growth — KES 1,500/mo', business: 'Business — KES 5,000/mo' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [form, setForm]     = useState({
    first_name: '', last_name: '', email: '',
    phone: '', password: '', company: '',
    plan: params.get('plan') || 'starter'
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    setLoading(true)
    try {
      const data = await register({
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        full_name: `${form.first_name} ${form.last_name}`.trim(),
        company: form.company,
        plan: form.plan
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
            🔐 OTP<span style={{ color: 'var(--green)' }}>Guard</span>
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
                value={form.email} onChange={set('email')} 
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>Phone (optional)</label>
              <input style={inputStyle} type="tel" placeholder="+254700000000"
                value={form.phone} onChange={set('phone')}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block' }}>Password</label>
              <input style={inputStyle} type="password" placeholder="Min. 8 characters"
                value={form.password} onChange={set('password')} required
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
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
