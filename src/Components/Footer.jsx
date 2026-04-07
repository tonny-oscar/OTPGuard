export default function Footer() {
  return (
    <footer style={{ background:'var(--surface)', borderTop:'1px solid var(--border)', padding:'48px 20px 24px' }}>
      <div className="container">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:40, marginBottom:40 }}>
          <div>
            <div style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--heading)', marginBottom:12 }}>
              🔐 OTP<span style={{ color:'var(--green)' }}>Guard</span>
            </div>
            <p style={{ fontSize:'.9rem', lineHeight:1.7 }}>Security made simple. Protect every login with powerful MFA.</p>
          </div>
          <div>
            <div style={{ color:'var(--heading)', fontWeight:600, marginBottom:12 }}>Product</div>
            {['Features','Pricing','How It Works','Demo'].map(l => (
              <div key={l} style={{ marginBottom:8 }}>
                <a href={`#${l.toLowerCase().replace(/ /g,'-')}`} style={{ color:'var(--text)', textDecoration:'none', fontSize:'.9rem' }}>{l}</a>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color:'var(--heading)', fontWeight:600, marginBottom:12 }}>Legal</div>
            {['Privacy Policy','Terms of Service'].map(l => (
              <div key={l} style={{ marginBottom:8 }}>
                <a href="#" style={{ color:'var(--text)', textDecoration:'none', fontSize:'.9rem' }}>{l}</a>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color:'var(--heading)', fontWeight:600, marginBottom:12 }}>Contact</div>
            <p style={{ fontSize:'.9rem' }}>📧 hello@otpguard.co.ke</p>
            <p style={{ fontSize:'.9rem', marginTop:8 }}>📞 +254 794 886 149</p>
          </div>
        </div>
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:24, textAlign:'center', fontSize:'.85rem' }}>
          © {new Date().getFullYear()} OTPGuard. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
