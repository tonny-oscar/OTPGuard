import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { Link } from 'react-router-dom'

const steps = [
  {
    num: '01',
    title: 'Create Your Account',
    desc: 'Sign up for free in under two minutes. No credit card required. Your account comes pre-configured with a sandbox environment for immediate testing.',
  },
  {
    num: '02',
    title: 'Get Your API Key',
    desc: 'From your dashboard, generate an API key. This key authenticates all requests from your application to the OTPGuard platform.',
  },
  {
    num: '03',
    title: 'Integrate the API',
    desc: 'Add two API calls to your login flow — one to send the OTP and one to verify it. Our REST API works with any language or framework. Average integration time is under one hour.',
  },
  {
    num: '04',
    title: 'Enable MFA for Your Users',
    desc: 'Users can activate MFA from their account settings. They choose their preferred channel — SMS, email, or authenticator app. You control which channels are available per plan.',
  },
  {
    num: '05',
    title: 'Monitor and Manage',
    desc: 'Your admin dashboard shows real-time login activity, MFA adoption rates, failed attempts, and device trust status. Set up alerts for suspicious behaviour.',
  },
]

const integrations = [
  { name: 'Node.js', note: 'Official SDK' },
  { name: 'Python', note: 'Official SDK' },
  { name: 'PHP', note: 'Official SDK' },
  { name: 'REST API', note: 'Any language' },
  { name: 'Go', note: 'Community SDK' },
  { name: 'Ruby', note: 'Community SDK' },
]

const useCases = [
  { title: 'SaaS Applications', desc: 'Protect user accounts in your web application with minimal friction. Add MFA to your existing login flow without rebuilding authentication from scratch.' },
  { title: 'Fintech & Banking', desc: 'Meet regulatory requirements for strong customer authentication. OTPGuard supports the verification flows required by financial compliance frameworks.' },
  { title: 'E-commerce Platforms', desc: 'Reduce account takeover fraud at checkout. Trigger OTP verification for high-value transactions or when a login comes from an unrecognised device.' },
  { title: 'Healthcare Systems', desc: 'Protect sensitive patient data with an additional verification layer. Audit logs and access records support HIPAA-aligned security practices.' },
]

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {/* Hero */}
        <section style={{ padding: '80px 20px 60px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <div className="tag">How It Works</div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, color: 'var(--heading)', lineHeight: 1.2, marginBottom: 20 }}>
              From Zero to Secure<br />in Under an Hour
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.8, marginBottom: 36 }}>
              OTPGuard is designed to integrate cleanly into any existing application. No infrastructure changes. No complex configuration. Just a few API calls.
            </p>
            <Link to="/register" className="btn-primary" style={{ padding: '13px 32px', fontSize: '1rem' }}>
              Start for Free
            </Link>
          </div>
        </section>

        {/* Steps */}
        <section style={{ padding: '72px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 860 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 48, textAlign: 'center' }}>The Integration Process</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {steps.map((step, i) => (
                <div key={step.num} style={{ display: 'flex', gap: 32, alignItems: 'flex-start', paddingBottom: i < steps.length - 1 ? 40 : 0, position: 'relative' }}>
                  {/* Line connector */}
                  {i < steps.length - 1 && (
                    <div style={{ position: 'absolute', left: 19, top: 48, width: 2, height: 'calc(100% - 8px)', background: 'var(--border)' }} />
                  )}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green)', color: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.85rem', flexShrink: 0, zIndex: 1 }}>
                    {step.num}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <h3 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{step.title}</h3>
                    <p style={{ color: 'var(--text)', fontSize: '.95rem', lineHeight: 1.75 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Code example */}
        <section style={{ padding: '72px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="container" style={{ maxWidth: 860 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 8 }}>Simple API Integration</h2>
            <p style={{ color: 'var(--text)', marginBottom: 32, lineHeight: 1.7 }}>Two endpoints. That is all you need to add MFA to your application.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 20 }}>
              <div>
                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>1. Send OTP</div>
                <pre style={{ background: '#0a0e1a', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px', fontSize: '.82rem', color: '#e2e8f0', overflowX: 'auto', lineHeight: 1.7, margin: 0 }}>{`POST /api/mfa/send
Authorization: Bearer <api_key>

{
  "user_id": "usr_123",
  "method": "sms",
  "phone": "+254700000000"
}`}</pre>
              </div>
              <div>
                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>2. Verify OTP</div>
                <pre style={{ background: '#0a0e1a', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px', fontSize: '.82rem', color: '#e2e8f0', overflowX: 'auto', lineHeight: 1.7, margin: 0 }}>{`POST /api/mfa/verify
Authorization: Bearer <api_key>

{
  "user_id": "usr_123",
  "code": "847291"
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section style={{ padding: '72px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 8, textAlign: 'center' }}>Works With Your Stack</h2>
            <p style={{ color: 'var(--text)', textAlign: 'center', marginBottom: 40 }}>Official and community SDKs available for the most popular languages.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
              {integrations.map(item => (
                <div key={item.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 28px', textAlign: 'center', minWidth: 130 }}>
                  <div style={{ fontWeight: 700, color: 'var(--heading)', marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--green)' }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section style={{ padding: '72px 20px' }}>
          <div className="container">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 8, textAlign: 'center' }}>Built for Every Industry</h2>
            <p style={{ color: 'var(--text)', textAlign: 'center', marginBottom: 40 }}>OTPGuard adapts to the security requirements of your specific domain.</p>
            <div className="grid-4">
              {useCases.map(uc => (
                <div key={uc.title} className="card">
                  <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 10, fontSize: '1rem' }}>{uc.title}</h3>
                  <p style={{ color: 'var(--text)', fontSize: '.9rem', lineHeight: 1.75 }}>{uc.desc}</p>
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
