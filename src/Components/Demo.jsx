import { useState } from 'react'

const MOCK_OTP = '482916'

export default function Demo() {
  const [step, setStep] = useState('login') // login | otp | success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (!email) return setError('Enter an email to continue')
    setError('')
    setStep('otp')
  }

  function handleOtp(e) {
    e.preventDefault()
    if (otp === MOCK_OTP) { setError(''); setStep('success') }
    else setError('Invalid OTP. Hint: try ' + MOCK_OTP)
  }

  const inputStyle = {
    width:'100%', padding:'12px 16px', borderRadius:8,
    background:'var(--bg)', border:'1px solid var(--border)',
    color:'var(--heading)', fontSize:'1rem', outline:'none',
    transition:'border-color .2s'
  }

  return (
    <section id="demo">
      <div className="container">
        <div className="tag"> Live Demo</div>
        <h2 className="section-title">See It in Action</h2>
        <p className="section-sub">Experience the full login + OTP flow right here.</p>

        <div style={{ maxWidth:420, margin:'0 auto' }}>
          <div className="card">
            {step === 'login' && (
              <>
                <h3 style={{ color:'var(--heading)', marginBottom:24, textAlign:'center' }}> Sign In</h3>
                <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <input style={inputStyle} type="email" placeholder="your@email.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={e => e.target.style.borderColor='var(--green)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'}
                  />
                  <input style={inputStyle} type="password" placeholder="Password"
                    defaultValue="demo1234"
                    onFocus={e => e.target.style.borderColor='var(--green)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'}
                  />
                  {error && <p style={{ color:'#f87171', fontSize:'.85rem' }}>{error}</p>}
                  <button type="submit" className="btn-primary" style={{ width:'100%', textAlign:'center' }}>
                    Continue →
                  </button>
                </form>
              </>
            )}

            {step === 'otp' && (
              <>
                <div style={{ textAlign:'center', marginBottom:24 }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:12 }}></div>
                  <h3 style={{ color:'var(--heading)', marginBottom:8 }}>Enter OTP</h3>
                  <p style={{ fontSize:'.9rem' }}>A 6-digit code was sent to <strong style={{ color:'var(--green)' }}>{email}</strong></p>
                </div>
                <form onSubmit={handleOtp} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <input style={{ ...inputStyle, textAlign:'center', fontSize:'1.5rem', letterSpacing:8 }}
                    type="text" maxLength={6} placeholder="000000"
                    value={otp} onChange={e => setOtp(e.target.value)}
                    onFocus={e => e.target.style.borderColor='var(--green)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'}
                  />
                  {error && <p style={{ color:'#f87171', fontSize:'.85rem', textAlign:'center' }}>{error}</p>}
                  <button type="submit" className="btn-primary" style={{ width:'100%', textAlign:'center' }}>
                    Verify OTP
                  </button>
                  <button type="button" onClick={() => setStep('login')}
                    style={{ background:'none', border:'none', color:'var(--text)', cursor:'pointer', fontSize:'.85rem' }}>
                    ← Back
                  </button>
                </form>
              </>
            )}

            {step === 'success' && (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:'3rem', marginBottom:16 }}>✅</div>
                <h3 style={{ color:'var(--green)', marginBottom:12 }}>Login Successful!</h3>
                <p style={{ fontSize:'.9rem', marginBottom:24 }}>Your account is protected by OTPGuard MFA.</p>
                <button className="btn-primary" onClick={() => { setStep('login'); setEmail(''); setOtp(''); }}>
                  Try Again
                </button>
              </div>
            )}
          </div>

          <p style={{ textAlign:'center', marginTop:16, fontSize:'.8rem', opacity:.6 }}>
            Demo only — no real data is sent
          </p>
        </div>
      </div>
    </section>
  )
}

