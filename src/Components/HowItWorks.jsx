const steps = [
  { num:'01', title:'Integrate the API', desc:'Add our simple REST API to your app with just a few lines of code. SDKs available.' },
  { num:'02', title:'Enable MFA for Users', desc:'Users toggle MFA on from their settings. Choose SMS, Email, or Authenticator.' },
  { num:'03', title:'Protect Every Login', desc:'Every login is verified with a one-time code. Hackers can\'t get in — even with the password.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works">
      <div className="container">
        <div className="tag">How It Works</div>
        <h2 className="section-title">Up and Running in 3 Simple Steps</h2>
        <p className="section-sub">No complex setup. No DevOps headaches.</p>

        <div className="grid-3">
          {steps.map((s, i) => (
            <div key={s.num} style={{ position:'relative' }}>
              <div className="card" style={{ textAlign:'center' }}>
                <div style={{
                  fontSize:'3rem', fontWeight:800,
                  color:'transparent',
                  WebkitTextStroke:'2px var(--green)',
                  marginBottom:20, opacity:.4
                }}>{s.num}</div>
                <h3 style={{ color:'var(--heading)', fontWeight:600, marginBottom:12 }}>{s.title}</h3>
                <p style={{ fontSize:'.9rem', lineHeight:1.7 }}>{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  display:'none',
                  position:'absolute', top:'50%', right:-20,
                  color:'var(--green)', fontSize:'1.5rem'
                }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
