const features = [
  { label: 'SMS', title: 'SMS OTP', desc: 'Deliver one-time codes via SMS to any phone number instantly.' },
  { label: 'Email', title: 'Email OTP', desc: 'Send secure OTP codes to user email addresses in seconds.' },
  { label: 'TOTP', title: 'Authenticator App', desc: 'Support Google Authenticator & Authy via TOTP standard.' },
  { label: 'Backup', title: 'Backup Codes', desc: 'Give users emergency backup codes when their device is unavailable.' },
  { label: 'Device', title: 'Device Tracking', desc: 'Monitor trusted devices and flag suspicious login locations.' },
  { label: 'Admin', title: 'Admin Dashboard', desc: 'Real-time analytics, login attempts, and MFA adoption stats.' },
]

export default function Features() {
  return (
    <section id="features" style={{ background: 'var(--surface)' }}>
      <div className="container">
        <div className="tag">Features</div>
        <h2 className="section-title">Everything You Need to Secure Logins</h2>
        <p className="section-sub">One platform. Multiple channels. Full control.</p>

        <div className="grid-3">
          {features.map(f => (
            <div key={f.title} className="card">
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.2)', marginBottom: 16 }}>
                <span style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--green)', letterSpacing: .5 }}>{f.label}</span>
              </div>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: '.9rem', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
