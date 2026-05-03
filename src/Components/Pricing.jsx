import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const plans = [
  {
    id: 'starter', name: 'Starter', price: { kes: 0, usd: 0 }, tag: 'Free forever',
    features: ['Up to 50 users', 'Email OTP only', 'Basic dashboard', 'Community support'],
    cta: 'Start Free', highlight: false
  },
  {
    id: 'growth', name: 'Growth', price: { kes: 1500, usd: 10 }, tag: 'Most Popular',
    features: ['Up to 1,000 users', 'SMS + Email OTP', 'Full dashboard', 'Priority email support', 'Login analytics'],
    cta: 'Get Started', highlight: true
  },
  {
    id: 'business', name: 'Business', price: { kes: 5000, usd: 35 }, tag: 'Best Value',
    features: ['Unlimited users', 'All OTP channels', 'Admin dashboard', 'Device tracking', 'Priority support', 'Custom branding'],
    cta: 'Get Started', highlight: false
  },
  {
    id: 'enterprise', name: 'Enterprise', price: { kes: null, usd: null }, tag: 'Custom',
    features: ['Everything in Business', 'Dedicated server', 'SLA guarantee', 'On-premise option', 'Custom integrations'],
    cta: 'Contact Us', highlight: false
  },
]

export default function Pricing() {
  const [currency, setCurrency] = useState('kes')
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleCTA(plan) {
    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:hello@otpguard.co.ke?subject=Enterprise Plan Inquiry'
      return
    }
    if (user) {
      navigate('/dashboard')
    } else {
      navigate(`/register?plan=${plan.id}`)
    }
  }

  return (
    <section id="pricing" style={{ background: 'var(--surface)' }}>
      <div className="container">
        <div className="tag">Pricing</div>
        <h2 className="section-title">Simple, AffordablePricing</h2>
        <p className="section-sub">Start free. Scale as you grow. No hidden fees.</p>

        {/* Currency toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
          {['kes', 'usd'].map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={{
              padding: '8px 24px', borderRadius: 6,
              border: `1px solid ${currency === c ? 'var(--green)' : 'var(--border)'}`,
              background: currency === c ? 'var(--green)' : 'transparent',
              color: currency === c ? '#0a0e1a' : 'var(--text)',
              cursor: 'pointer', fontWeight: 700, fontSize: '.9rem', transition: 'all .2s'
            }}>{c.toUpperCase()}</button>
          ))}
        </div>

        <div className="grid-4">
          {plans.map(p => (
            <div key={p.id} className="card" style={{
              border: p.highlight ? '1px solid var(--green)' : '1px solid var(--border)',
              position: 'relative', display: 'flex', flexDirection: 'column'
            }}>
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--green)', color: '#0a0e1a',
                  padding: '3px 16px', borderRadius: 20, fontSize: '.75rem',
                  fontWeight: 700, whiteSpace: 'nowrap'
                }}>Most Popular</div>
              )}

              <div style={{ fontSize: '.78rem', color: 'var(--green)', marginBottom: 6, fontWeight: 600 }}>{p.tag}</div>
              <div style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>{p.name}</div>

              <div style={{ marginBottom: 24 }}>
                {p.price[currency] === null ? (
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)' }}>Custom</span>
                ) : p.price[currency] === 0 ? (
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)' }}>Free</span>
                ) : (
                  <>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)' }}>
                      {currency === 'kes' ? `KES ${p.price.kes.toLocaleString()}` : `$${p.price.usd}`}
                    </span>
                    <span style={{ fontSize: '.85rem', color: 'var(--text)' }}>/mo</span>
                  </>
                )}
              </div>

              <ul style={{ listStyle: 'none', marginBottom: 28, flex: 1 }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontSize: '.88rem', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCTA(p)}
                className={p.highlight ? 'btn-primary' : 'btn-outline'}
                style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: '.88rem', opacity: .7 }}>Per-SMS charges apply on Growth & Business plans. Setup fee: KES 5,000–20,000 for custom integrations.
        </p>
      </div>
    </section>
  )
}



