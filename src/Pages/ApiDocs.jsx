import { Link } from 'react-router-dom'

export default function ApiDocs() {
  const apiUrl = `http://${window.location.hostname}:5000`

  const endpoints = [
    {
      category: 'Authentication',
      routes: [
        { method: 'POST', path: '/api/auth/register', desc: 'Create new account' },
        { method: 'POST', path: '/api/auth/login', desc: 'Login with email/phone' },
        { method: 'POST', path: '/api/auth/refresh', desc: 'Refresh access token' },
        { method: 'GET', path: '/api/auth/me', desc: 'Get current user info' },
      ]
    },
    {
      category: 'MFA - SMS/Email',
      routes: [
        { method: 'POST', path: '/api/mfa/send', desc: 'Send initial OTP' },
        { method: 'POST', path: '/api/mfa/resend', desc: 'Resend OTP (rate limited)' },
        { method: 'POST', path: '/api/mfa/verify', desc: 'Verify OTP code' },
      ]
    },
    {
      category: 'MFA - TOTP (Authenticator App)',
      routes: [
        { method: 'POST', path: '/api/mfa/totp/setup', desc: 'Generate QR code' },
        { method: 'POST', path: '/api/mfa/totp/confirm', desc: 'Enable authenticator app' },
      ]
    },
    {
      category: 'Backup Codes',
      routes: [
        { method: 'GET', path: '/api/mfa/backup-codes', desc: 'Get backup codes' },
        { method: 'POST', path: '/api/mfa/backup-codes/verify', desc: 'Use backup code' },
      ]
    },
    {
      category: 'User Settings',
      routes: [
        { method: 'GET', path: '/api/users/mfa', desc: 'Get MFA settings' },
        { method: 'PUT', path: '/api/users/mfa', desc: 'Update MFA settings' },
      ]
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 40 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: 700, color: 'var(--heading)', marginBottom: 20, display: 'inline-block' }}>
            🔐 OTPGuard
          </Link>
          <h1 style={{ color: 'var(--heading)', marginTop: 0, marginBottom: 8 }}>API Documentation</h1>
          <p style={{ color: 'var(--text)', fontSize: '1.1rem' }}>
            InteractiveSwagger UI available at{' '}
            <a href={`${apiUrl}/apidocs`} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
              {apiUrl}/apidocs →
            </a>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 40 }}>
          <a href={`${apiUrl}/apidocs`} target="_blank" rel="noreferrer"
            style={{
              background: 'linear-gradient(135deg, var(--green), rgba(0, 255, 136, 0.8))',
              padding: 24,
              borderRadius: 12,
              textDecoration: 'none',
              color: '#000',
              fontWeight: 600,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            📚 Open Swagger UI
          </a>
          <a href={`${apiUrl}/api/health`} target="_blank" rel="noreferrer"
            style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              padding: 24,
              borderRadius: 12,
              textDecoration: 'none',
              color: 'var(--text)',
              fontWeight: 600,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            💚 API Health
          </a>
        </div>

        {endpoints.map((section, idx) => (
          <div key={idx} style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'var(--green)', fontSize: '1.3rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              {section.category}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.routes.map((route, i) => (
                <div key={i} style={{
                  background: 'rgba(0, 255, 136, 0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{
                        background: route.method === 'GET' ? '#3b82f6' : route.method === 'POST' ? '#10b981' : '#f59e0b',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: '.85rem',
                        fontWeight: 700
                      }}>
                        {route.method}
                      </span>
                      <code style={{ color: 'var(--green)', fontFamily: 'monospace', fontSize: '.95rem' }}>
                        {route.path}
                      </code>
                    </div>
                    <p style={{ color: 'var(--text)', fontSize: '.9rem', margin: 0 }}>{route.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: 12,
          padding: 24,
          marginTop: 40
        }}>
          <h3 style={{ color: 'var(--heading)', marginTop: 0 }}>🔑 Authentication</h3>
          <p style={{ color: 'var(--text)' }}>
            Most endpoints require <code style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '2px 6px', borderRadius: 3 }}>Authorization: Bearer [token]</code> header.
          </p>
          <ol style={{ color: 'var(--text)' }}>
            <li>Call <code>/api/auth/login</code> with email and password</li>
            <li>If MFA required, use <code>/api/mfa/send</code> to get OTP</li>
            <li>Call <code>/api/mfa/verify</code> with the OTP code</li>
            <li>Use returned <code>access_token</code> for API calls</li>
          </ol>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <Link to="/" style={{ color: 'var(--green)', textDecoration: 'none', fontSize: '.9rem' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
