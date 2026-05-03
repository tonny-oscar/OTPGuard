import { Link } from 'react-router-dom'
import heroImg    from '../assets/pexels-indraprojectsofficial-27742642.jpg'
import secImg     from '../assets/pexels-cottonbro-5474292.jpg'
import problemImg from '../assets/pexels-pixabay-60504.jpg'
import ctaImg     from '../assets/pexels-sora-shimazaki-5935791.jpg'
import isoImg     from '../assets/istockphoto-2200469339-612x612.jpg'

const stats = [
  { val: '99.9%', label: 'Uptime SLA' },
  { val: '< 3s',  label: 'OTP Delivery' },
  { val: '50+',   label: 'Businesses' },
  { val: '3',     label: 'OTP Channels' },
]

const features = [
  { label: 'SMS',    title: 'SMS Verification',  desc: 'Deliver one-time codes to any mobile number in seconds. Supports local and international carriers with automatic retry.' },
  { label: 'Email',  title: 'Email OTP',          desc: 'Send secure verification codes to user inboxes. Works with any email provider, zero configuration required.' },
  { label: 'TOTP',   title: 'Authenticator App',  desc: 'Full TOTP support compatible with Google Authenticator, Authy, and Microsoft Authenticator via RFC 6238.' },
  { label: 'Device', title: 'Device Trust',       desc: 'Track and whitelist known devices. Flag logins from unrecognised locations and prompt re-verification automatically.' },
  { label: 'Backup', title: 'Backup Codes',       desc: 'Auto-generate emergency codes for users who lose access to their primary MFA device. Hashed and stored securely.' },
  { label: 'Admin',  title: 'Admin Dashboard',    desc: 'Real-time analytics, MFA adoption rates, churn analysis, and compliance audit trails — all in one place.' },
]

const steps = [
  { num: '01', title: 'Integrate the API',    desc: 'Two REST API calls added to your login flow. Works with any language or framework. Average integration time under one hour.' },
  { num: '02', title: 'Enable MFA for Users', desc: 'Users activate MFA from their account settings and choose their preferred channel. You control which channels are available.' },
  { num: '03', title: 'Protect Every Login',  desc: 'Every login is verified with a time-limited one-time code. Even a compromised password cannot grant access.' },
]

const testimonials = [
  { name: 'James Mwangi',  role: 'CTO, FinPay Kenya',             quote: 'We integrated OTPGuard in a single afternoon. Our fraud rate dropped by over 80% in the first month.' },
  { name: 'Amina Hassan',  role: 'Lead Developer, ShopEase',      quote: 'The API is clean and well-documented. We added SMS OTP to our checkout flow without touching our auth system.' },
  { name: 'David Ochieng', role: 'Security Engineer, HealthLink',  quote: 'The audit trail and GDPR-ready data handling made it straightforward to satisfy our security review.' },
]

const trustedBy = ['FinPay', 'ShopEase', 'HealthLink', 'LogiTrack', 'PaySafe', 'BuildCo']

const securityPoints = [
  { title: 'End-to-End Encryption', desc: 'All data in transit encrypted with TLS 1.3. Sensitive data at rest encrypted with AES-256.' },
  { title: 'Rate Limiting',         desc: 'Automatic lockout after repeated failed attempts. Suspicious IPs flagged and blocked in real time.' },
  { title: 'Audit Logging',         desc: 'Every admin action, login event, and MFA change logged with full context for compliance.' },
  { title: 'GDPR Compliant',        desc: 'Data export and deletion endpoints available. User data handled per GDPR requirements.' },
]

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── HERO ── */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,255,136,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(59,130,246,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', padding: '60px 24px' }}>
          {/* LEFT */}
          <div>
            <div className="tag" style={{ marginBottom: 20 }}>Multi-Factor Authentication Platform</div>
            <h1 style={{ fontSize: 'clamp(2.2rem,4.5vw,3.8rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.1, marginBottom: 22 }}>
              Stop Account<br />Takeovers.<br />
              <span style={{ color: 'var(--green)' }} className="glow-green">Protect Every Login.</span>
            </h1>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--text)', marginBottom: 32, maxWidth: 460 }}>
              OTPGuard adds robust multi-factor authentication to any application in under an hour — SMS, email, and authenticator app support through a single clean API.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
              <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '13px 30px' }}>Get Started Free</Link>
              <Link to="/how-it-works" className="btn-outline" style={{ fontSize: '1rem', padding: '13px 30px' }}>See How It Works</Link>
            </div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              {stats.map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — image with overlays */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -12, borderRadius: 28, background: 'linear-gradient(135deg, rgba(0,255,136,.12), rgba(59,130,246,.06))', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 20, left: -6, width: 4, height: 72, borderRadius: 4, background: 'var(--green)', zIndex: 2 }} />
            <div style={{ position: 'absolute', bottom: 20, right: -6, width: 4, height: 72, borderRadius: 4, background: 'var(--blue)', zIndex: 2 }} />
            <img src={heroImg} alt="Secure authentication" style={{ width: '100%', height: 500, objectFit: 'cover', borderRadius: 20, display: 'block', position: 'relative', zIndex: 1, boxShadow: '0 24px 64px rgba(0,0,0,.5), 0 0 0 1px rgba(0,255,136,.1)' }} />
            {/* live badge */}
            <div style={{ position: 'absolute', bottom: 24, left: 24, zIndex: 3, background: 'rgba(10,14,26,.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,255,136,.25)', borderRadius: 12, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', flexShrink: 0, animation: 'blink 1.2s infinite' }} />
              <div>
                <div style={{ fontSize: '.76rem', fontWeight: 700, color: '#f1f5f9' }}>Protected in real time</div>
                <div style={{ fontSize: '.68rem', color: '#64748b', marginTop: 1 }}>OTP verified in under 3 seconds</div>
              </div>
            </div>
            {/* uptime badge */}
            <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 3, background: 'rgba(10,14,26,.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(59,130,246,.25)', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--green)' }}>99.9%</div>
              <div style={{ fontSize: '.65rem', color: '#64748b', marginTop: 1 }}>Uptime SLA</div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:768px){.hero-grid{grid-template-columns:1fr!important}.hero-img-wrap{display:none}}`}</style>
      </section>

      {/* ── TRUSTED BY ── */}
      <section style={{ padding: '24px 20px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container">
          <p style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 16, fontWeight: 700 }}>Trusted by growing businesses</p>
          <div style={{ display: 'flex', gap: 36, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {trustedBy.map(name => (
              <span key={name} style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', opacity: .4, letterSpacing: .5 }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION — image left ── */}
      <section style={{ padding: 0, borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))' }}>
          {/* image */}
          <div style={{ position: 'relative', minHeight: 420 }}>
            <img src={problemImg} alt="Security threat" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 420 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 40%, var(--bg) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)' }} />
            <div style={{ position: 'absolute', bottom: 28, left: 28 }}>
              <div style={{ background: 'rgba(248,113,113,.15)', border: '1px solid rgba(248,113,113,.4)', borderRadius: 10, padding: '10px 16px', display: 'inline-block' }}>
                <span style={{ color: '#f87171', fontWeight: 700, fontSize: '.82rem' }}>80% of breaches use stolen credentials</span>
              </div>
            </div>
          </div>
          {/* content */}
          <div style={{ padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="tag">The Problem</div>
            <h2 style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.3, marginBottom: 16, marginTop: 8 }}>
              Passwords Alone Are Not Enough
            </h2>
            <p style={{ color: 'var(--text)', lineHeight: 1.85, marginBottom: 14 }}>
              Over 80% of data breaches involve compromised credentials. Attackers use phishing, credential stuffing, and brute force attacks to gain access to accounts protected only by passwords.
            </p>
            <p style={{ color: 'var(--text)', lineHeight: 1.85, marginBottom: 24 }}>
              Once inside, the damage is immediate — financial loss, data theft, and reputational harm that takes years to recover from.
            </p>
            <div className="tag" style={{ alignSelf: 'flex-start' }}>The Solution</div>
            <h2 style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.3, marginBottom: 16, marginTop: 8 }}>
              A Second Layer That Actually Works
            </h2>
            <p style={{ color: 'var(--text)', lineHeight: 1.85 }}>
              OTPGuard adds a time-limited, single-use verification code to every login. Even if an attacker has the password, they cannot access the account without the code delivered to the user's device.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '64px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="tag">Features</div>
          <h2 className="section-title">Everything You Need to Secure Logins</h2>
          <p className="section-sub">One platform. Multiple channels. Full control over your authentication layer.</p>
          <div className="grid-3">
            {features.map(f => (
              <div key={f.title} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--green), transparent)', opacity: 0, transition: 'opacity .2s' }} className="card-top-line" />
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 10, background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.2)', marginBottom: 16 }}>
                  <span style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--green)', letterSpacing: .5 }}>{f.label}</span>
                </div>
                <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 8, fontSize: '1rem' }}>{f.title}</h3>
                <p style={{ fontSize: '.88rem', lineHeight: 1.75, color: 'var(--text)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/features" className="btn-outline" style={{ padding: '11px 28px' }}>View All Features</Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '64px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="tag">How It Works</div>
          <h2 className="section-title">Up and Running in 3 Steps</h2>
          <p className="section-sub">No complex setup. No infrastructure changes. Just a clean API integration.</p>
          <div className="grid-3">
            {steps.map((s, i) => (
              <div key={s.num} className="card" style={{ textAlign: 'center', position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: '50%', right: -13, width: 26, height: 2, background: 'var(--border)', zIndex: 1, display: 'none' }} className="step-connector" />
                )}
                <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'transparent', WebkitTextStroke: '2px var(--green)', marginBottom: 16, opacity: .35 }}>{s.num}</div>
                <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 10, fontSize: '1rem' }}>{s.title}</h3>
                <p style={{ fontSize: '.88rem', lineHeight: 1.75, color: 'var(--text)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/how-it-works" className="btn-outline" style={{ padding: '11px 28px' }}>Full Integration Guide</Link>
          </div>
        </div>
      </section>

      {/* ── SECURITY — full-bleed image bg ── */}
      <section style={{ padding: 0, borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <img src={secImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,14,26,.97) 0%, rgba(10,14,26,.88) 60%, rgba(10,14,26,.75) 100%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '64px 24px' }}>
          <div className="tag">Security</div>
          <h2 className="section-title" style={{ color: '#f1f5f9' }}>Security at Every Layer</h2>
          <p className="section-sub" style={{ color: '#94a3b8' }}>OTPGuard is built with security as a first principle, not an afterthought.</p>
          <div className="grid-4">
            {securityPoints.map(p => (
              <div key={p.title} style={{ background: 'rgba(15,22,41,.8)', border: '1px solid rgba(0,255,136,.12)', borderRadius: 14, padding: '24px 20px', backdropFilter: 'blur(8px)', transition: 'border-color .2s, transform .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,136,.4)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,255,136,.12)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ width: 28, height: 3, background: 'var(--green)', borderRadius: 2, marginBottom: 14 }} />
                <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 8, fontSize: '.95rem' }}>{p.title}</h3>
                <p style={{ fontSize: '.85rem', lineHeight: 1.75, color: '#94a3b8' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '64px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container">
          <div className="tag">Customer Stories</div>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-sub">Businesses across East Africa trust OTPGuard to protect their users.</p>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <div key={t.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
                {/* large quote mark */}
                <div style={{ position: 'absolute', top: 16, right: 20, fontSize: '4rem', lineHeight: 1, color: 'var(--green)', opacity: .08, fontFamily: 'Georgia, serif', pointerEvents: 'none' }}>"</div>
                <p style={{ fontSize: '.92rem', lineHeight: 1.85, color: 'var(--text)', fontStyle: 'italic', flex: 1, position: 'relative' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, var(--green), #00cc6a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0a0e1a', fontSize: '.9rem', flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--heading)', fontSize: '.88rem' }}>{t.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--green)', marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section id="pricing" style={{ padding: '64px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="tag">Pricing</div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.25, marginBottom: 16, marginTop: 8 }}>
                Start Free.<br />Scale as You Grow.
              </h2>
              <p style={{ color: 'var(--text)', lineHeight: 1.85, marginBottom: 14 }}>
                The Starter plan is free forever and covers up to 50 users with email OTP. Paid plans start at KES 1,500 per month and unlock SMS, analytics, and advanced security features.
              </p>
              <p style={{ color: 'var(--text)', lineHeight: 1.85, marginBottom: 28, fontSize: '.92rem' }}>
                No credit card required. No hidden fees. Cancel at any time.
              </p>
              <Link to="/pricing" className="btn-primary" style={{ padding: '13px 32px', fontSize: '1rem' }}>View Full Pricing</Link>
            </div>
            {/* pricing preview cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'Starter', price: 'Free', color: '#64748b', sub: 'Up to 50 users · Email OTP' },
                { name: 'Growth',  price: 'KES 1,500/mo', color: 'var(--green)', sub: 'Up to 1,000 users · SMS + Email', highlight: true },
                { name: 'Business', price: 'KES 5,000/mo', color: 'var(--blue)', sub: 'Unlimited users · All channels' },
              ].map(p => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: p.highlight ? 'var(--green-dim)' : 'var(--surface)', border: `1px solid ${p.highlight ? 'rgba(0,255,136,.3)' : 'var(--border)'}`, borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--heading)', fontSize: '.9rem' }}>{p.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 2 }}>{p.sub}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: p.color, fontSize: '.9rem', whiteSpace: 'nowrap' }}>{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA — full-bleed image ── */}
      <section style={{ padding: 0, position: 'relative', overflow: 'hidden' }}>
        <img src={ctaImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,14,26,.96) 0%, rgba(10,14,26,.85) 100%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', textAlign: 'center', maxWidth: 720 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,136,.1)', border: '1px solid rgba(0,255,136,.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'blink 1.2s infinite' }} />
            <span style={{ fontSize: '.78rem', color: 'var(--green)', fontWeight: 600 }}>50+ businesses protected today</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 18 }}>
            Your Users Deserve<br />Better Protection
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.85, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            Account takeovers are preventable. OTPGuard gives you the tools to stop them — without slowing down your development or your users.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>Create Free Account</Link>
            <Link to="/contact" className="btn-outline" style={{ fontSize: '1rem', padding: '14px 32px' }}>Talk to the Team</Link>
          </div>
          <p style={{ marginTop: 20, fontSize: '.82rem', color: '#475569' }}>
            No credit card required · Free plan available · Cancel anytime
          </p>
        </div>
      </section>

    </div>
  )
}
