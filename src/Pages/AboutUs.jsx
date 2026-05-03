import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { Link } from 'react-router-dom'

const team = [
  { name: 'Tonny Bett', role: 'Founder & CEO', bio: 'Security engineer with 5 years of experience building authentication systems for financial institutions across East Africa.' },
  { name: 'Tonny Bett', role: 'CTO', bio: 'Backend architect specialising in distributed systems and API design. Previously led engineering at two Nairobi-based fintech startups.' },
  { name: 'Erasmus kipkosgei', role: 'Head of Product', bio: 'Product leader focused on developer experience. Passionate about making security tools accessible to teams of all sizes.' },
  { name: 'ERasmus and Tonny', role: 'Lead Security Engineer', bio: 'Certified ethical hacker and penetration tester. Responsible for OTPGuard\'s security architecture and compliance framework.' },
]

const values = [
  { title: 'Security First', desc: 'Every decision we make starts with the question: does this make our customers more secure? We never trade security for convenience.' },
  { title: 'Developer Experience', desc: 'We believe security tools should be easy to use. If integration takes more than an hour, we have failed. We obsess over documentation, SDKs, and clear error messages.' },
  { title: 'Transparency', desc: 'We publish our uptime history, communicate incidents promptly, and price our services without hidden fees. Trust is built through honesty.' },
  { title: 'Built for Africa', desc: 'OTPGuard is designed with African infrastructure in mind — local carrier integrations, M-Pesa billing, and support for the connectivity realities of our market.' },
]

const milestones = [
  { year: '2022', event: 'OTPGuard founded in Nairobi. First version of the API launched with email OTP support.' },
  { year: '2023', event: 'SMS delivery added with Africa\'s Talking and Twilio integrations. First 10 paying customers.' },
  { year: '2024', event: 'TOTP authenticator app support launched. Admin dashboard released. Reached 50+ businesses protected.' },
  { year: '2025', event: 'Enterprise plan launched. Compliance and audit trail features added. Expanding across East Africa.' },
]

export default function AboutUs() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>

        {/* Hero */}
        <section style={{ padding: '80px 20px 64px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 740 }}>
            <div className="tag">About OTPGuard</div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.2, marginBottom: 20 }}>
              We Make Account Security<br />Accessible to Every Developer
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1.85, marginBottom: 0 }}>
              OTPGuard was founded in Nairobi with a single mission: to make multi-factor authentication simple enough that every application — from a two-person startup to an enterprise — can protect its users without a dedicated security team.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section style={{ padding: '72px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 900 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 48, alignItems: 'center' }}>
              <div>
                <div className="tag">Our Mission</div>
                <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.3, marginBottom: 20 }}>
                  Eliminate Account Takeovers Across Africa
                </h2>
                <p style={{ color: 'var(--text)', lineHeight: 1.85, marginBottom: 16 }}>
                  Account takeover fraud costs African businesses hundreds of millions of shillings every year. Most of these attacks succeed because applications rely on passwords alone — a problem that multi-factor authentication solves completely.
                </p>
                <p style={{ color: 'var(--text)', lineHeight: 1.85 }}>
                  We built OTPGuard because the existing MFA solutions were either too expensive, too complex to integrate, or not designed for African infrastructure. We wanted to change that.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { val: '99.9%', label: 'Platform uptime' },
                  { val: '50+', label: 'Businesses protected' },
                  { val: '< 3s', label: 'Average OTP delivery' },
                  { val: '3', label: 'OTP delivery channels' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green)', minWidth: 80 }}>{s.val}</div>
                    <div style={{ color: 'var(--text)', fontSize: '.95rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ padding: '72px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="container">
            <div className="tag">Our Values</div>
            <h2 className="section-title">What We Stand For</h2>
            <p className="section-sub">The principles that guide every product decision we make.</p>
            <div className="grid-4">
              {values.map(v => (
                <div key={v.title} className="card">
                  <div style={{ width: 32, height: 3, background: 'var(--green)', borderRadius: 2, marginBottom: 16 }} />
                  <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 10, fontSize: '1rem' }}>{v.title}</h3>
                  <p style={{ color: 'var(--text)', fontSize: '.9rem', lineHeight: 1.75 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section style={{ padding: '72px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <div className="tag">Our Story</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 40 }}>How We Got Here</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {milestones.map((m, i) => (
                <div key={m.year} style={{ display: 'flex', gap: 28, paddingBottom: i < milestones.length - 1 ? 36 : 0, position: 'relative' }}>
                  {i < milestones.length - 1 && (
                    <div style={{ position: 'absolute', left: 19, top: 44, width: 2, height: 'calc(100% - 8px)', background: 'var(--border)' }} />
                  )}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green)', color: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.75rem', flexShrink: 0, zIndex: 1 }}>
                    {m.year.slice(2)}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '.85rem', marginBottom: 4 }}>{m.year}</div>
                    <p style={{ color: 'var(--text)', fontSize: '.95rem', lineHeight: 1.75 }}>{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section style={{ padding: '72px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="container">
            <div className="tag">The Team</div>
            <h2 className="section-title">The People Behind OTPGuard</h2>
            <p className="section-sub">A small, focused team of engineers and product builders based in Nairobi.</p>
            <div className="grid-4">
              {team.map(member => (
                <div key={member.name} className="card">
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--green-dim)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: 'var(--green)', marginBottom: 16 }}>
                    {member.name.charAt(0)}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--heading)', marginBottom: 4 }}>{member.name}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--green)', fontWeight: 600, marginBottom: 12 }}>{member.role}</div>
                  <p style={{ color: 'var(--text)', fontSize: '.88rem', lineHeight: 1.75 }}>{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: 580 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 16 }}>Ready to protect your users?</h2>
            <p style={{ color: 'var(--text)', marginBottom: 32, lineHeight: 1.7 }}>
              Join the businesses across East Africa that trust OTPGuard to secure their applications.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary" style={{ padding: '13px 32px' }}>Get Started Free</Link>
              <Link to="/contact" className="btn-outline" style={{ padding: '13px 32px' }}>Talk to Us</Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
