import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() { logout(); navigate('/'); setOpen(false) }

  const navLinks = [
    { label: 'Features',     href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing',      href: '/#pricing' },
    { label: 'Docs',         href: '/docs' },
    { label: 'API',          href: '/api-docs' },
  ]

  return (
    <nav style={{
      background: 'rgba(10,14,26,.97)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '1.2rem' }}>
            OTP<span style={{ color: 'var(--green)' }}>Guard</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(item => (
            <a key={item.label} href={item.href} style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '.92rem', transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--green)'}
              onMouseLeave={e => e.target.style.color = 'var(--text)'}
            >{item.label}</a>
          ))}
        </div>

        {/* Desktop auth */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="desktop-nav">
          {!user ? (
            <>
              <Link to="/login"    className="btn-outline" style={{ padding: '8px 20px', fontSize: '.9rem' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '.9rem' }}>Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '.92rem', padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
              >Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '.92rem', padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
                >Admin</Link>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontWeight: 700, fontSize: '.85rem' }}>
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '.85rem', padding: '4px 8px', borderRadius: 6, transition: 'color .2s' }}
                  onMouseEnter={e => e.target.style.color = '#f87171'}
                  onMouseLeave={e => e.target.style.color = 'var(--text)'}
                >Logout</button>
              </div>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(o => !o)} className="hamburger" style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--heading)', fontSize: '1.5rem', padding: 4,
        }}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
        }} className="mobile-menu">
          {navLinks.map(item => (
            <a key={item.label} href={item.href} onClick={() => setOpen(false)}
              style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '.95rem', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              {item.label}
            </a>
          ))}
          {!user ? (
            <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
              <Link to="/login"    className="btn-outline" style={{ flex: 1, textAlign: 'center', padding: '10px' }} onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '10px' }} onClick={() => setOpen(false)}>Get Started</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
              <Link to="/dashboard" onClick={() => setOpen(false)} style={{ color: 'var(--green)', textDecoration: 'none', fontSize: '.95rem' }}>Dashboard</Link>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)} style={{ color: 'var(--green)', textDecoration: 'none', fontSize: '.95rem' }}>Admin</Link>}
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '.95rem', textAlign: 'left', padding: 0 }}>Logout</button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
