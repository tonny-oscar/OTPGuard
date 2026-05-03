import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const plans = [
  {
    id: 'starter', name: 'Starter', price: { kes: 0, usd: 0 }, tag: 'Free forever',
    features: ['Up to 50 users', 'Email OTP only', 'Basic dashboard', 'Community support', 'REST API access', 'Sandbox environment'],
    cta: 'Start Free', highlight: false
  },
  {
    id: 'growth', name: 'Growth', price: { kes: 1500, usd: 10 }, tag: 'Most Popular',
    features: ['Up to 1,000 users', 'SMS + Email OTP', 'Full analytics dashboard', 'Priority email support', 'Login analytics', 'Webhook support', 'Device tracking'],
    cta: 'Get Started', highlight: true
  },
  {
    id: 'business', name: 'Business', price: { kes: 5000, usd: 35 }, tag: 'Best Value',
    features: ['Unlimited users', 'All OTP channels', 'Admin dashboard', 'Churn & retention reports', 'Priority support', 'Custom branding', 'Audit trail', 'TOTP + Backup codes'],
    cta: 'Get Started', highlight: false
  },
  {
    id: 'enterprise', name: 'Enterprise', price: { kes: null, usd: null }, tag: 'Custom',
    features: ['Everything in Business', 'Dedicated infrastructure', 'SLA guarantee', 'On-premise deployment', 'Custom integrations', 'Dedicated account manager'],
    cta: 'Contact Us', highlight: false
  },
]

const faqs = [
  { q: 'Is there a free trial?', a: 'The Starter plan is free forever with no time limit. Paid plans can be tested with a 14-day trial — no credit card required.' },
  { q: 'What are the per-SMS charges?', a: 'SMS delivery costs vary by carrier and country. On Growth and Business plans, SMS is billed at cost plus a small platform fee. Full pricing is available in your billing dashboard.' },
  { q: 'Can I change plans at any time?', a: 'Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades apply at the end of your current billing cycle.' },
  { q: 'Is there a setup fee?', a: 'No setup fee for Starter, Growth, or Business plans. Enterprise and custom integration projects may carry a one-time setup fee of KES 5,000–20,000 depending on scope.' },
  { q: 'What payment methods are accepted?', a: 'We accept M-Pesa, Visa, Mastercard, and bank transfer for annual plans. All payments are processed securely.' },
]

export default function PricingPage() {
  const [currency, setCurrency] = useState('kes')
  const [openFaq, setOpenFaq] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleCTA(plan) {
    if (plan.id === 'enterprise') { window.location.href = 'mailto:hello@otpguard.co.ke?subject=Enterprise Plan Inquiry'; return }
    navigate(user ? '/dashboard' : `/register?plan=${plan.id}`)
  }

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {/* Hero */}
        <section style={{ padding: '80px 20px 60px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 680 }}>
            <div className="tag">Pricing</div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.2, marginBottom: 16 }}>
              Transparent Pricing.<br />No Surprises.
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.8 }}>
              Start free and scale as your user base grows. Every plan includes full API access and our core security features.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section style={{ padding: '64px 20px' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 48 }}>
              {['kes', 'usd'].map(c => (
                <button key={c} onClick={() => setCurrency(c)} style={{
                  padding: '8px 28px', borderRadius: 6,
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
                      padding: '3px 16px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700, whiteSpace: 'nowrap'
                    }}>Most Popular</div>
                  )}
                  <div style={{ fontSize: '.75rem', color: 'var(--green)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .8 }}>{p.tag}</div>
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
                      <li key={f} style={{ fontSize: '.88rem', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--text)' }}>
                        <span style={{ color: 'var(--green)', flexShrink: 0, fontWeight: 700 }}>+</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleCTA(p)} className={p.highlight ? 'btn-primary' : 'btn-outline'} style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                    {p.cta}
                  </button>
                </div>
              ))}
            </div>

            <p style={{ textAlign: 'center', marginTop: 32, fontSize: '.85rem', color: 'var(--text)', opacity: .7 }}>
              Per-SMS charges apply on Growth and Business plans. Setup fee of KES 5,000–20,000 for custom enterprise integrations.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '64px 20px', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 8, textAlign: 'center' }}>Frequently Asked Questions</h2>
            <p style={{ textAlign: 'center', color: 'var(--text)', marginBottom: 40 }}>Everything you need to know about our pricing.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                    width: '100%', textAlign: 'left', padding: '16px 20px',
                    background: openFaq === i ? 'var(--green-dim)' : 'var(--surface)',
                    border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    color: 'var(--heading)', fontWeight: 600, fontSize: '.95rem',
                  }}>
                    {faq.q}
                    <span style={{ color: 'var(--green)', fontSize: '1.1rem', flexShrink: 0, marginLeft: 12 }}>{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 20px 16px', background: 'var(--surface)', color: 'var(--text)', fontSize: '.9rem', lineHeight: 1.75 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
