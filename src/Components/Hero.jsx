import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section style={{ padding:'100px 20px 80px', textAlign:'center', position:'relative', overflow:'hidden' }}>
      {/* background glow blobs */}
      <div style={{
        position:'absolute', top:'10%', left:'20%', width:400, height:400,
        background:'radial-gradient(circle, rgba(0,255,136,.08) 0%, transparent 70%)',
        pointerEvents:'none'
      }}/>
      <div style={{
        position:'absolute', top:'20%', right:'15%', width:300, height:300,
        background:'radial-gradient(circle, rgba(59,130,246,.08) 0%, transparent 70%)',
        pointerEvents:'none'
      }}/>

      <div className="container" style={{ position:'relative' }}>
        <div className="tag">🔐 MFA Security Platform</div>

        <h1 style={{
          fontSize:'clamp(2.2rem, 6vw, 4rem)',
          fontWeight:800,
          color:'var(--heading)',
          lineHeight:1.15,
          marginBottom:24
        }}>
          Secure Your App in Minutes<br/>
          <span style={{ color:'var(--green)' }} className="glow-green">with Powerful MFA</span>
        </h1>

        <p style={{ fontSize:'1.15rem', maxWidth:560, margin:'0 auto 40px', lineHeight:1.8 }}>
          Stop account hacking. Build user trust. Stay compliant.
          OTPGuard adds OTP authentication to any app — SMS, Email, or Authenticator.
        </p>

        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ fontSize:'1rem', padding:'14px 32px' }}>
            Get Started Free →
          </Link>
          <a href="#demo" className="btn-outline" style={{ fontSize:'1rem', padding:'14px 32px' }}>
            Try Demo
          </a>
        </div>

        <div style={{ display:'flex', gap:32, justifyContent:'center', marginTop:56, flexWrap:'wrap' }}>
          {[
            { val:'99.9%', label:'Uptime' },
            { val:'< 3s', label:'OTP Delivery' },
            { val:'50+', label:'Happy Clients' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--green)' }}>{s.val}</div>
              <div style={{ fontSize:'.85rem', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
