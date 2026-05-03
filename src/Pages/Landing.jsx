import { Link } from 'react-router-dom'

const stats = [
  { val: '99.9%', label: 'Platform Uptime' },
  { val: '< 3s',  label: 'OTP Delivery Time' },
  { val: '50+',   label: 'Businesses Protected' },
  { val: '3',     label: 'OTP Channels' },
]

const features = [
  { label: 'SMS', title: 'SMS Verification', desc: 'Deliver one-time codes to any mobile number in seconds. Supports local and international carriers with automatic retry on failure.' },
  { label: 'Email', title: 'Email OTP', desc: 'Send secure verification codes to user inboxes. Works with any email provider and requires no configuration on the user side.' },
  { label: 'TOTP', title: 'Authenticator App', desc: 'Full TOTP support compatible with Google Authenticator, Authy, and Microsoft Authenticator via the RFC 6238 standard.' },
  { label: 'Device', title: 'Device Trust', desc: 'Track and whitelist known devices. Flag logins from unrecognised browsers or locations and prompt for re-verification automatically.' },
  { label: 'Backup', title: 'Backup Codes', desc: 'Auto-generate emergency codes for users who lose access to their primary MFA device. Codes are hashed and stored securely.' },
  { label: 'Admin', title: 'Admin Dashboard', desc: 'Real-time analytics, MFA adoption rates, churn analysis, and compliance audit trails — all in one place.' },
]

const steps = [
  { num: '01', title: 'Integrate the API', desc: 'Add two REST API calls to your login flow — one to send the OTP and one to verify it. Works with any language or framework.' },
  { num: '02', title: 'Enable MFA for Users', desc: 'Users activate MFA from their account settings and choose their preferred channel. You control which channels are available.' },
  { num: '03', title: 'Protect Every Login', desc: 'Every login is verified with a time-limited one-time code. Even if a password is compromised, the account stays secure.' },
]

const testimonials = [
  { name: 'James Mwangi', role: 'CTO, FinPay Kenya', quote: 'We integrated OTPGuard in a single afternoon. Our fraud rate dropped by over 80% in the first month. The admin dashboard gives us visibility we never had before.' },
  { name: 'Amina Hassan', role: 'Lead Developer, ShopEase', quote: 'The API is clean and well-documented. We added SMS OTP to our checkout flow without touching our authentication system. Exactly what we needed.' },
  { name: 'David Ochieng', role: 'Security Engineer, HealthLink', quote: 'Compliance was our main concern. The audit trail and GDPR-ready data handling made it straightforward to satisfy our security review.' },
]

const trustedBy = ['FinPay', 'ShopEase', 'HealthLink', 'LogiTrack', 'PaySafe', 'BuildCo']

const securityPoints = [
  { title: 'End-to-End Encryption', desc: 'All data in transit is encrypted using TLS 1.3. Sensitive data at rest is encrypted using AES-256.' },
  { title: 'Rate Limiting', desc: 'Automatic lockout after repeated failed attempts. Suspicious IPs are flagged and blocked in real time.' },
  { title: 'Audit Logging', desc: 'Every admin action, login event, and MFA change is logged with full context for compliance and forensics.' },
  { title: 'GDPR Compliant', desc: 'Data export and deletion endpoints are available. User data is handled in accordance with GDPR requirements.' },
]

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* HERO */}
      <section style={{ padding: '100px 20px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,255,136,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(59,130,246,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', maxWidth: 820 }}>
          <div className="tag">Multi-Factor Authentication Platform</div>
          <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4.2rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.12, marginBottom: 24 }}>
            Stop Account Takeovers.<br />
            <span style={{ color: 'var(--green)' }} className="glow-green">Protect Every Login.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.85, color: 'var(--text)' }}>
            OTPGuard adds robust multi-factor authentication to any application in under an hour. SMS, email, and authenticator app support — all through a single, clean API.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>Get Started Free</Link>
            <Link to="/how-it-works" className="btn-outline" style={{ fontSize: '1rem', padding: '14px 36px' }}>See How It Works</Link>
          </div>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>{s.val}</div>
                <div style={{ fontSize: '.85rem', marginTop: 4, color: 'var(--text)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section style={{ padding: '40px 20px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container">
          <p style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24, fontWeight: 600 }}>Trusted by growing businesses</p>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {trustedBy.map(name => (
              <span key={name} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', opacity: .5, letterSpacing: .5 }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section style={{ padding: '80px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="tag">The Problem</div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.3, marginBottom: 20 }}>
                Passwords Alone Are Not Enough
              </h2>
              <p style={{ color: 'var(--text)', lineHeight: 1.85, marginBottom: 16 }}>
                Over 80% of data breaches involve compromised credentials. Attackers use phishing, credential stuffing, and brute force attacks to gain access to accounts protected only by passwords.
              </p>
              <p style={{ color: 'var(--text)', lineHeight: 1.85 }}>
                Once inside, the damage is immediate — financial loss, data theft, and reputational harm that takes years to recover from.
              </p>
            </div>
            <div>
              <div className="tag">The Solution</div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.3, marginBottom: 20 }}>
                A Second Layer That Actually Works
              </h2>
              <p style={{ color: 'var(--text)', lineHeight: 1.85, marginBottom: 16 }}>
                OTPGuard adds a time-limited, single-use verification code to every login. Even if an attacker has the password, they cannot access the account without the code delivered to the user's device.
              </p>
              <p style={{ color: 'var(--text)', lineHeight: 1.85 }}>
                The integration takes less than an hour and requires no changes to your existing authentication infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="tag">Features</div>
          <h2 className="section-title">Everything You Need to Secure Logins</h2>
          <p className="section-sub">One platform. Multiple channels. Full control over your authentication layer.</p>
          <div className="grid-3">
            {features.map(f => (
              <div key={f.title} className="card">
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.2)', marginBottom: 16 }}>
                  <span style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--green)', letterSpacing: .5 }}>{f.label}</span>
                </div>
                <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: '.9rem', lineHeight: 1.75, color: 'var(--text)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/features" className="btn-outline" style={{ padding: '11px 28px' }}>View All Features</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '80px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="tag">How It Works</div>
          <h2 className="section-title">Up and Running in 3 Steps</h2>
          <p className="section-sub">No complex setup. No infrastructure changes. Just a clean API integration.</p>
          <div className="grid-3">
            {steps.map(s => (
              <div key={s.num} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'transparent', WebkitTextStroke: '2px var(--green)', marginBottom: 20, opacity: .4 }}>{s.num}</div>
                <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: '.9rem', lineHeight: 1.75, color: 'var(--text)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/how-it-works" className="btn-outline" style={{ padding: '11px 28px' }}>Full Integration Guide</Link>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section style={{ padding: '80px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="tag">Security</div>
          <h2 className="section-title">Security at Every Layer</h2>
          <p className="section-sub">OTPGuard is built with security as a first principle, not an afterthought.</p>
          <div className="grid-4">
            {securityPoints.map(p => (
              <div key={p.title} className="card">
                <div style={{ width: 32, height: 3, background: 'var(--green)', borderRadius: 2, marginBottom: 16 }} />
                <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 8, fontSize: '1rem' }}>{p.title}</h3>
                <p style={{ fontSize: '.88rem', lineHeight: 1.75, color: 'var(--text)' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="tag">Customer Stories</div>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-sub">Businesses across East Africa trust OTPGuard to protect their users.</p>
          <div className="grid-3">
            {testimonials.map(t => (
              <div key={t.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p style={{ fontSize: '.95rem', lineHeight: 1.8, color: 'var(--text)', fontStyle: 'italic', flex: 1 }}>"{t.quote}"</p>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--heading)', fontSize: '.9rem' }}>{t.name}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--green)', marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section id="pricing" style={{ padding: '80px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
          <div className="tag">Pricing</div>
          <h2 className="section-title">Start Free. Scale as You Grow.</h2>
          <p style={{ color: 'var(--text)', lineHeight: 1.8, marginBottom: 16, fontSize: '1.05rem' }}>
            The Starter plan is free forever and covers up to 50 users with email OTP. Paid plans start at KES 1,500 per month and unlock SMS, analytics, and advanced security features.
          </p>
          <p style={{ color: 'var(--text)', lineHeight: 1.8, marginBottom: 36, fontSize: '.95rem' }}>
            No credit card required to get started. No hidden fees. Cancel at any time.
          </p>
          <Link to="/pricing" className="btn-primary" style={{ padding: '13px 36px', fontSize: '1rem' }}>View Full Pricing</Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.25, marginBottom: 20 }}>
            Your Users Deserve Better Protection
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.85, marginBottom: 40 }}>
            Account takeovers are preventable. OTPGuard gives you the tools to stop them — without slowing down your development or your users.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>Create Free Account</Link>
            <a href="mailto:hello@otpguard.co.ke" className="btn-outline" style={{ fontSize: '1rem', padding: '14px 36px' }}>Talk to the Team</a>
          </div>
          <p style={{ marginTop: 24, fontSize: '.85rem', color: 'var(--text)', opacity: .6 }}>
            No credit card required · Free plan available · Cancel anytime
          </p>
        </div>
      </section>

    </div>
  )
}
