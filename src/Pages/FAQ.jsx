import { useState } from 'react'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { Link } from 'react-router-dom'

const faqs = [
  {
    category: 'General',
    items: [
      {
        q: 'What is OTPGuard?',
        a: 'OTPGuard is a multi-factor authentication platform that lets developers add OTP-based verification to any application via a simple REST API. It supports SMS, email, and authenticator app (TOTP) delivery channels.'
      },
      {
        q: 'Who is OTPGuard built for?',
        a: 'OTPGuard is built for developers and businesses of any size who want to add a second layer of security to their applications without building authentication infrastructure from scratch. It works for SaaS platforms, fintech apps, e-commerce stores, healthcare systems, and more.'
      },
      {
        q: 'Do I need to change my existing authentication system?',
        a: 'No. OTPGuard sits on top of your existing login flow. You keep your current username and password system and add two API calls — one to send the OTP and one to verify it. No architectural changes are required.'
      },
      {
        q: 'Is OTPGuard available in Kenya and other African countries?',
        a: 'Yes. OTPGuard is built and operated from Nairobi, Kenya. SMS delivery is optimised for East African carriers including Safaricom, Airtel, and Telkom. We support international numbers as well.'
      },
    ]
  },
  {
    category: 'Security',
    items: [
      {
        q: 'How secure are the OTP codes?',
        a: 'OTP codes are cryptographically random, 6 digits, and expire after 5 minutes. Each code is single-use — once verified, it cannot be reused. Failed attempts are rate-limited and suspicious IPs are automatically flagged.'
      },
      {
        q: 'What happens if a user loses access to their MFA device?',
        a: 'Users on Growth and Business plans can generate backup codes in advance. These are one-time emergency codes that allow account recovery without the primary MFA device. Admins can also reset MFA for a user from the admin dashboard.'
      },
      {
        q: 'Is my data encrypted?',
        a: 'Yes. All data in transit is encrypted using TLS 1.3. Sensitive data at rest — including OTP secrets and user credentials — is encrypted using AES-256. We do not store plaintext OTP codes after verification.'
      },
      {
        q: 'Is OTPGuard GDPR compliant?',
        a: 'Yes. OTPGuard provides data export and deletion endpoints to help you meet GDPR requirements. All admin actions are logged in an audit trail. User data is handled in accordance with our Privacy Policy.'
      },
      {
        q: 'What protection is there against brute force attacks?',
        a: 'OTPGuard enforces rate limiting on OTP verification attempts. After a configurable number of failed attempts, the account is temporarily locked and the admin is alerted. Suspicious IPs are flagged in real time on the security dashboard.'
      },
    ]
  },
  {
    category: 'Integration',
    items: [
      {
        q: 'How long does integration take?',
        a: 'Most developers complete a basic integration in under one hour. The core flow requires two API calls. Full documentation with code examples is available for Node.js, Python, and PHP.'
      },
      {
        q: 'Which programming languages are supported?',
        a: 'OTPGuard provides a REST API that works with any language. Official SDKs are available for Node.js, Python, and PHP. Community SDKs exist for Go and Ruby. If your language is not listed, you can use the REST API directly with any HTTP client.'
      },
      {
        q: 'Is there a sandbox for testing?',
        a: 'Yes. Every account includes a sandbox environment that mirrors production behaviour without sending real SMS or email messages. OTP codes are logged to your dashboard for testing purposes.'
      },
      {
        q: 'Can I use webhooks to receive OTP events?',
        a: 'Yes. Growth and Business plans support webhooks. You can configure a URL to receive real-time notifications for events including OTP sent, verified, failed, and expired.'
      },
    ]
  },
  {
    category: 'Billing & Plans',
    items: [
      {
        q: 'Is there a free plan?',
        a: 'Yes. The Starter plan is free forever and supports up to 50 users with email OTP. No credit card is required to sign up.'
      },
      {
        q: 'What are the per-SMS charges?',
        a: 'SMS delivery costs vary by carrier and destination country. On Growth and Business plans, SMS is billed at cost plus a small platform fee. Full per-SMS pricing is visible in your billing dashboard before you send any messages.'
      },
      {
        q: 'Can I upgrade or downgrade my plan at any time?',
        a: 'Yes. You can upgrade immediately from your dashboard — the new features are available right away. Downgrades take effect at the end of your current billing cycle.'
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept M-Pesa, Visa, Mastercard, and bank transfer for annual plans. All payments are processed securely.'
      },
      {
        q: 'Is there a setup fee?',
        a: 'No setup fee for Starter, Growth, or Business plans. Enterprise and custom integration projects may carry a one-time setup fee of KES 5,000–20,000 depending on scope.'
      },
    ]
  },
  {
    category: 'Support',
    items: [
      {
        q: 'How do I get support?',
        a: 'Starter plan users have access to community support via email. Growth and Business plan users receive priority email support with a response time of under 24 hours. Enterprise customers get a dedicated account manager.'
      },
      {
        q: 'What is the uptime guarantee?',
        a: 'OTPGuard targets 99.9% uptime. Scheduled maintenance is communicated in advance. Enterprise customers with SLA agreements receive contractual uptime guarantees.'
      },
      {
        q: 'How do I contact the team?',
        a: 'You can reach us at otpguard26@gmail.com or by phone at +254 794 886 149. You can also use the contact form on our Contact page.'
      },
    ]
  },
]

export default function FAQ() {
  const [open, setOpen] = useState({})
  const toggle = (cat, i) => setOpen(prev => ({ ...prev, [`${cat}-${i}`]: !prev[`${cat}-${i}`] }))

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {/* Hero */}
        <section style={{ padding: '80px 20px 60px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 680 }}>
            <div className="tag">FAQ</div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.2, marginBottom: 16 }}>
              Frequently Asked Questions
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.8 }}>
              Everything you need to know about OTPGuard. Can't find your answer?{' '}
              <Link to="/contact" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Contact us</Link>.
            </p>
          </div>
        </section>

        {/* FAQ sections */}
        <section style={{ padding: '64px 20px' }}>
          <div className="container" style={{ maxWidth: 800 }}>
            {faqs.map(group => (
              <div key={group.category} style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--heading)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                  {group.category}
                </h2>
                <div style={{ width: 32, height: 3, background: 'var(--green)', borderRadius: 2, marginBottom: 20 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {group.items.map((item, i) => {
                    const key = `${group.category}-${i}`
                    const isOpen = !!open[key]
                    return (
                      <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                        <button
                          onClick={() => toggle(group.category, i)}
                          style={{
                            width: '100%', textAlign: 'left', padding: '16px 20px',
                            background: isOpen ? 'var(--green-dim)' : 'var(--surface)',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                            color: 'var(--heading)', fontWeight: 600, fontSize: '.95rem', lineHeight: 1.5,
                          }}
                        >
                          <span>{item.q}</span>
                          <span style={{ color: 'var(--green)', fontSize: '1.2rem', flexShrink: 0, fontWeight: 400 }}>
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        {isOpen && (
                          <div style={{ padding: '4px 20px 18px', background: 'var(--surface)', color: 'var(--text)', fontSize: '.92rem', lineHeight: 1.8 }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '64px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 12 }}>Still have questions?</h2>
            <p style={{ color: 'var(--text)', marginBottom: 28, lineHeight: 1.7 }}>
              Our team is happy to help. Reach out and we will get back to you within 24 hours.
            </p>
            <Link to="/contact" className="btn-primary" style={{ padding: '13px 32px' }}>Contact Us</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
