import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { Link } from 'react-router-dom'
import featHero from '../assets/istockphoto-2200469339-612x612.jpg'

const features = [
  {
    category: 'Authentication Channels',
    items: [
      { label: 'SMS OTP', desc: 'Deliver time-sensitive one-time codes to any mobile number worldwide. Supports local and international carriers with sub-3-second delivery.' },
      { label: 'Email OTP', desc: 'Send secure verification codes directly to user inboxes. Works with any email provider and requires zero configuration on the user side.' },
      { label: 'Authenticator App (TOTP)', desc: 'Full TOTP support compatible with Google Authenticator, Authy, and Microsoft Authenticator. Industry-standard RFC 6238 implementation.' },
      { label: 'Backup Codes', desc: 'Auto-generate one-time emergency codes for users who lose access to their primary MFA device. Codes are hashed and stored securely.' },
    ]
  },
  {
    category: 'Security & Compliance',
    items: [
      { label: 'Device Fingerprinting', desc: 'Track and trust known devices. Flag logins from unrecognised browsers or locations and prompt for re-verification automatically.' },
      { label: 'Brute Force Protection', desc: 'Rate limiting and automatic lockout after repeated failed attempts. Suspicious IPs are flagged in real time on the admin dashboard.' },
      { label: 'Audit Trail', desc: 'Every admin action, login event, and MFA change is logged with timestamp, IP address, and user agent for full compliance traceability.' },
      { label: 'GDPR-Ready Data Handling', desc: 'User data is stored with encryption at rest. Export and deletion endpoints are available to meet GDPR and data residency requirements.' },
    ]
  },
  {
    category: 'Developer Experience',
    items: [
      { label: 'REST API', desc: 'Clean, well-documented REST endpoints. Integrate OTP generation, delivery, and verification into any stack in under an hour.' },
      { label: 'Webhook Support', desc: 'Receive real-time event notifications for OTP sent, verified, failed, and expired events directly to your backend.' },
      { label: 'SDK Libraries', desc: 'Official client libraries for Node.js, Python, and PHP. Community SDKs available for Go, Ruby, and Java.' },
      { label: 'Sandbox Environment', desc: 'Test your integration without sending real messages. The sandbox mirrors production behaviour with full logging.' },
    ]
  },
  {
    category: 'Admin & Analytics',
    items: [
      { label: 'Real-Time Dashboard', desc: 'Monitor active sessions, OTP delivery rates, failed attempts, and MFA adoption across your entire user base live.' },
      { label: 'Churn & Retention Analytics', desc: 'Identify inactive users, at-risk accounts, and voluntary churn patterns. Export reports as PDF for stakeholder reviews.' },
      { label: 'Revenue & Billing Reports', desc: 'Track subscription revenue by plan, SMS costs, and monthly active users. Full billing history with CSV export.' },
      { label: 'User Lifecycle Management', desc: 'Cohort analysis, onboarding completion rates, and feature adoption metrics to understand how users engage over time.' },
    ]
  },
]

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {/* Hero */}
        <section style={{ padding: 0, position: 'relative', overflow: 'hidden', minHeight: 320, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <img src={featHero} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,14,26,.96) 0%, rgba(10,14,26,.8) 60%, rgba(10,14,26,.5) 100%)' }} />
          <div className="container" style={{ maxWidth: 720, position: 'relative', zIndex: 1, padding: '56px 24px' }}>
            <div className="tag">Platform Features</div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 16, marginTop: 8 }}>
              Built for Security.<br />Designed for Developers.
            </h1>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#94a3b8', marginBottom: 28, maxWidth: 560 }}>
              OTPGuard gives you every tool needed to add robust multi-factor authentication to your application — from delivery channels to compliance reporting.
            </p>
            <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '13px 32px' }}>Start Building Free</Link>
          </div>
        </section>

        {/* Feature groups */}
        {features.map(group => (
          <section key={group.category} style={{ padding: '64px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="container">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--heading)', marginBottom: 8 }}>{group.category}</h2>
              <div style={{ width: 40, height: 3, background: 'var(--green)', borderRadius: 2, marginBottom: 36 }} />
              <div className="grid-4">
                {group.items.map(item => (
                  <div key={item.label} className="card">
                    <div style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--green)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>{item.label}</div>
                    <p style={{ fontSize: '.9rem', lineHeight: 1.75, color: 'var(--text)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section style={{ padding: '44px 20px', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: 600 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 16 }}>Ready to get started?</h2>
            <p style={{ color: 'var(--text)', marginBottom: 32, lineHeight: 1.7 }}>
              The free plan includes everything you need to protect up to 50 users. No credit card required.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary" style={{ padding: '13px 32px' }}>Create Free Account</Link>
              <Link to="/pricing" className="btn-outline" style={{ padding: '13px 32px' }}>View Pricing</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
