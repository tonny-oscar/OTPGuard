import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSubscription } from '../../hooks/useSubscription'

export default function TopBar({ onMenuClick }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { currentPlan } = useSubscription()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Mobile hamburger */}
      <button onClick={onMenuClick} className="mobile-menu-btn" style={{
        display: 'none', background: 'none', border: 'none',
        color: 'var(--heading)', fontSize: '1.3rem', cursor: 'pointer',
      }}>☰</button>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
        {/* Plan badge */}
        <span style={{ fontSize: '.75rem', background: 'var(--green-dim)', color: 'var(--green)', padding: '3px 10px', borderRadius: 10, border: '1px solid rgba(0,255,136,.3)', fontWeight: 700 }}>
          {currentPlan.toUpperCase()}
        </span>

        {/* Avatar + dropdown */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontWeight: 700, fontSize: '.85rem' }}>
              {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 40, width: 180,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.4)', zIndex: 100,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.8rem', color: 'var(--heading)', fontWeight: 600 }}>{user?.full_name || 'User'}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text)', marginTop: 2 }}>{user?.email}</div>
              </div>
              {[
                { label: '⚙️ Settings', action: () => { navigate('/settings'); setMenuOpen(false) } },
                { label: '↑ Upgrade Plan', action: () => { navigate('/#pricing'); setMenuOpen(false) } },
                { label: ' Sign out', action: handleLogout, red: true },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={{
                  width: '100%', textAlign: 'left', padding: '10px 16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '.85rem', color: item.red ? '#f87171' : 'var(--text)',
                  transition: 'background .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .mobile-menu-btn { display: block !important; } }
      `}</style>
    </div>
  )
}

