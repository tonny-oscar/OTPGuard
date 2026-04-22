import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      background: 'rgba(10,14,26,.97)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '16px 20px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.4rem' }}>🔐</span>
          <span style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '1.2rem' }}>
            OTP<span style={{ color: 'var(--green)' }}>Guard</span>
          </span>
        </Link>

        {/* Center nav — only public links, always visible */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {[
            { label: 'Features',     href: '/#features' },
            { label: 'How It Works', href: '/#how-it-works' },
            { label: 'Pricing',      href: '/#pricing' },
            { label: 'Docs',         href: '/docs' },
            { label: 'API',          href: '/api-docs' },
          ].map(item => (
            <a key={item.label} href={item.href} style={{
              color: 'var(--text)', textDecoration: 'none',
              fontSize: '.92rem', transition: 'color .2s'
            }}
              onMouseEnter={e => e.target.style.color = 'var(--green)'}
              onMouseLeave={e => e.target.style.color = 'var(--text)'}
            >{item.label}</a>
          ))}
        </div>

        {/* Right side — changes based on auth state */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {!user ? (
            <>
              <Link to="/login" className="btn-outline" style={{ padding: '8px 20px', fontSize: '.9rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '.9rem' }}>
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={{
                color: 'var(--text)', textDecoration: 'none',
                fontSize: '.92rem', padding: '8px 16px',
                borderRadius: 8, border: '1px solid var(--border)',
                transition: 'all .2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
              >
                🛡️ Dashboard
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" style={{
                  color: 'var(--text)', textDecoration: 'none',
                  fontSize: '.92rem', padding: '8px 16px',
                  borderRadius: 8, border: '1px solid var(--border)',
                  transition: 'all .2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
                >
                  ⚙️ Admin
                </Link>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--green)', fontWeight: 700, fontSize: '.85rem'
                }}>
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} style={{
                  background: 'none', border: 'none', color: 'var(--text)',
                  cursor: 'pointer', fontSize: '.85rem', padding: '4px 8px',
                  borderRadius: 6, transition: 'color .2s'
                }}
                  onMouseEnter={e => e.target.style.color = '#f87171'}
                  onMouseLeave={e => e.target.style.color = 'var(--text)'}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
