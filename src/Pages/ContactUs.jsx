import { useState } from 'react'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { API } from '../context/AuthContext'
import contactImg from '../assets/pexels-padrinan-2882630.jpg'

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 8,
  background: 'var(--bg)', border: '1px solid var(--border)',
  color: 'var(--heading)', fontSize: '1rem', outline: 'none',
  transition: 'border-color .2s',
}

const subjects = [
  'General Inquiry',
  'Technical Support',
  'Billing & Payments',
  'Enterprise Sales',
  'Partnership',
  'Report a Security Issue',
  'Other',
]

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.subject || !form.message) {
      return setError('Please fill in all fields.')
    }
    setLoading(true)
    try {
      const r = await fetch(`${API}/admin/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed to send message')
      setSuccess(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>

        {/* Hero */}
        <section style={{ padding: 0, position: 'relative', overflow: 'hidden', minHeight: 260, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <img src={contactImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,14,26,.97) 0%, rgba(10,14,26,.85) 60%, rgba(10,14,26,.5) 100%)' }} />
          <div className="container" style={{ maxWidth: 640, position: 'relative', zIndex: 1, padding: '52px 24px' }}>
            <div className="tag">Contact Us</div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 12, marginTop: 8 }}>Get in Touch</h1>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.8 }}>
              Have a question, need support, or want to discuss an enterprise plan? We respond to every message within 24 hours.
            </p>
          </div>
        </section>

        <section style={{ padding: '64px 20px' }}>
          <div className="container" style={{ maxWidth: 960 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 48 }}>

              {/* Contact info */}
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--heading)', marginBottom: 24 }}>Contact Information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    { label: 'Email', value: 'otpguard26@gmail.com', href: 'mailto:otpguard26@gmail.com' },
                    { label: 'Phone', value: '+254 794 886 149', href: 'tel:+254794886149' },
                    { label: 'Location', value: 'Nairobi, Kenya', href: null },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
                      {item.href ? (
                        <a href={item.href} style={{ color: 'var(--heading)', textDecoration: 'none', fontSize: '.95rem', fontWeight: 500 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--heading)'}
                        >{item.value}</a>
                      ) : (
                        <span style={{ color: 'var(--heading)', fontSize: '.95rem', fontWeight: 500 }}>{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 32, padding: '20px', background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.2)', borderRadius: 10 }}>
                  <div style={{ fontWeight: 700, color: 'var(--heading)', marginBottom: 8 }}>Response Times</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '.88rem', color: 'var(--text)' }}>
                    <div>Starter plan — within 48 hours</div>
                    <div>Growth plan — within 24 hours</div>
                    <div>Business plan — within 12 hours</div>
                    <div>Enterprise — dedicated account manager</div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--heading)', marginBottom: 24 }}>Send a Message</h2>

                {success ? (
                  <div style={{ padding: '32px 24px', background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.3)', borderRadius: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>Message Sent</div>
                    <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>
                      Thank you for reaching out. We have received your message and will get back to you within 24 hours.
                    </p>
                    <button onClick={() => setSuccess(false)} style={{ marginTop: 20, background: 'none', border: '1px solid var(--green)', color: 'var(--green)', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: '.9rem' }}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block', color: 'var(--text)' }}>Full Name</label>
                        <input style={inputStyle} type="text" placeholder="John Doe"
                          value={form.name} onChange={set('name')} required
                          onFocus={e => e.target.style.borderColor = 'var(--green)'}
                          onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block', color: 'var(--text)' }}>Email Address</label>
                        <input style={inputStyle} type="email" placeholder="you@company.com"
                          value={form.email} onChange={set('email')} required
                          onFocus={e => e.target.style.borderColor = 'var(--green)'}
                          onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block', color: 'var(--text)' }}>Subject</label>
                      <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.subject} onChange={set('subject')} required>
                        <option value="">Select a subject</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '.85rem', marginBottom: 6, display: 'block', color: 'var(--text)' }}>Message</label>
                      <textarea
                        style={{ ...inputStyle, minHeight: 140, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                        placeholder="Describe your question or issue in detail..."
                        value={form.message} onChange={set('message')} required
                        onFocus={e => e.target.style.borderColor = 'var(--green)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                      <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 4, textAlign: 'right' }}>
                        {form.message.length} / 2000
                      </div>
                    </div>

                    {error && (
                      <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: '.85rem' }}>
                        {error}
                      </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
