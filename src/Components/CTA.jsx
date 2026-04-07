import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section style={{ background:'var(--surface)', textAlign:'center' }}>
      <div className="container" style={{ maxWidth:700 }}>
        <div style={{ fontSize:'3rem', marginBottom:16 }}>🚀</div>
        <h2 className="section-title">Start Securing Your Platform Today</h2>
        <p style={{ marginBottom:40, fontSize:'1.05rem', lineHeight:1.8 }}>
          Join businesses protecting their users with OTPGuard.
          Setup takes minutes. Your users will thank you.
        </p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ fontSize:'1rem', padding:'14px 32px' }}>
            Get Started Free →
          </Link>
          <a href="mailto:hello@otpguard.co.ke" className="btn-outline" style={{ fontSize:'1rem', padding:'14px 32px' }}>
            Talk to Us
          </a>
        </div>
        <p style={{ marginTop:24, fontSize:'.85rem', opacity:.6 }}>
          No credit card required · Free plan available · Cancel anytime
        </p>
      </div>
    </section>
  )
}
