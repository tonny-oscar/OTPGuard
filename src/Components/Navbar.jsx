import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './shared/ThemeToggle'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() { logout(); navigate('/'); setOpen(false) }

  const navLinks = [
    { label: 'Features',     to: '/features' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Pricing',      to: '/pricing' },
    { label: 'About',        to: '/about' },
    { label: 'FAQ',          to: '/faq' },
    { label: 'Contact',      to: '/contact' },
    { label: 'Docs',         to: '/docs' },
  ]

  return (
    <nav style={{
      background: 'rgba(10,14,26,.97)',
      borderBottom: '1px solid rgba(0,255,136,.08)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>

        {/* ── LOGO ── */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Logo mark — circular container with green glow ring */}
          <div style={{
            width: 42, height: 42,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(0,255,136,.15) 0%, rgba(0,255,136,.05) 100%)',
            border: '1px solid rgba(0,255,136,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(0,255,136,.15), inset 0 1px 0 rgba(255,255,255,.06)',
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'box-shadow .25s, border-color .25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,136,.35), inset 0 1px 0 rgba(255,255,255,.06)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,.6)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px rgba(0,255,136,.15), inset 0 1px 0 rgba(255,255,255,.06)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,.3)' }}
          >
            <img
              src={logo}
              alt="OTPGuard"
              style={{ width: 30, height: 30, objectFit: 'contain', borderRadius: 6 }}
            />
          </div>

          {/* Brand name */}
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.18rem', letterSpacing: '-.02em' }}>
              OTP<span style={{ color: '#00ff88' }}>Guard</span>
            </span>
            <span style={{ fontSize: '.58rem', color: 'rgba(0,255,136,.6)', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', marginTop: 1 }}>
              MFA Platform
            </span>
          </div>
        </Link>

        {/* ── Desktop nav links ── */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(item => (
            <Link key={item.label} to={item.to}
              style={{ color: '#64748b', textDecoration: 'none', fontSize: '.88rem', fontWeight: 500, transition: 'color .2s', letterSpacing: '.01em' }}
              onMouseEnter={e => e.currentTarget.style.color = '#00ff88'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >{item.label}</Link>
          ))}
        </div>

        {/* ── Desktop auth ── */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="desktop-nav">
          <ThemeToggle inNavbar />
          {!user ? (
            <>
              <Link to="/login" style={{
                color: '#94a3b8', textDecoration: 'none', fontSize: '.88rem', fontWeight: 600,
                padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)',
                transition: 'all .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,136,.4)'; e.currentTarget.style.color = '#00ff88' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#94a3b8' }}
              >Login</Link>
              <Link to="/register" style={{
                background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                color: '#0a0e1a', fontWeight: 800, fontSize: '.88rem',
                padding: '8px 20px', borderRadius: 8, textDecoration: 'none',
                transition: 'opacity .2s, transform .15s', display: 'inline-block',
                boxShadow: '0 4px 14px rgba(0,255,136,.25)',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard"
                style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '.88rem', padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,136,.4)'; e.currentTarget.style.color = '#00ff88' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#94a3b8' }}
              >Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin"
                  style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '.88rem', padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,136,.4)'; e.currentTarget.style.color = '#00ff88' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#94a3b8' }}
                >Admin</Link>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(0,255,136,.2), rgba(0,255,136,.05))',
                  border: '1px solid rgba(0,255,136,.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#00ff88', fontWeight: 800, fontSize: '.85rem',
                  boxShadow: '0 0 8px rgba(0,255,136,.15)',
                }}>
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '.85rem', padding: '4px 8px', borderRadius: 6, transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >Logout</button>
              </div>
            </>
          )}
        </div>

        {/* ── Hamburger ── */}
        <button onClick={() => setOpen(o => !o)} className="hamburger" style={{
          display: 'none', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 8, cursor: 'pointer', color: '#f1f5f9',
          width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'border-color .2s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,.4)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'}
        >
          {open ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div style={{
          background: '#0d1117',
          borderTop: '1px solid rgba(0,255,136,.08)',
          padding: '12px 20px 20px',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {navLinks.map(item => (
            <Link key={item.label} to={item.to} onClick={() => setOpen(false)}
              style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '.95rem', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'block', fontWeight: 500, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#00ff88'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >{item.label}</Link>
          ))}
          <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '.85rem', color: '#64748b', fontWeight: 500 }}>Appearance</span>
            <ThemeToggle inNavbar />
          </div>
          {!user ? (
            <div style={{ display: 'flex', gap: 10, paddingTop: 14 }}>
              <Link to="/login" onClick={() => setOpen(false)} style={{
                flex: 1, textAlign: 'center', padding: '11px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,.12)', color: '#94a3b8',
                textDecoration: 'none', fontSize: '.9rem', fontWeight: 600,
              }}>Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} style={{
                flex: 1, textAlign: 'center', padding: '11px', borderRadius: 8,
                background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                color: '#0a0e1a', textDecoration: 'none', fontSize: '.9rem', fontWeight: 800,
              }}>Get Started</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14 }}>
              <Link to="/dashboard" onClick={() => setOpen(false)} style={{ color: '#00ff88', textDecoration: 'none', fontSize: '.95rem', fontWeight: 600 }}>Dashboard</Link>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)} style={{ color: '#00ff88', textDecoration: 'none', fontSize: '.95rem', fontWeight: 600 }}>Admin</Link>}
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '.95rem', textAlign: 'left', padding: 0, fontWeight: 600 }}>Logout</button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
