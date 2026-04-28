import { Link, useLocation } from 'react-router-dom'
import { useSubscription } from '../../hooks/useSubscription'
import PlanBadge from '../shared/PlanBadge'

const navGroups = [
  {
    label: null,
    items: [
      { href: '/dashboard', icon: '🏠', label: 'Dashboard', plans: ['starter','growth','business','enterprise'] },
      { href: '/analytics', icon: '📈', label: 'Analytics', plans: ['growth','business','enterprise'], locked: ['starter'] },
      { href: '/devices',   icon: '💻', label: 'Devices',   plans: ['business','enterprise'], locked: ['starter','growth'] },
      { href: '/team',      icon: '👥', label: 'Team',      plans: ['enterprise'], locked: ['starter','growth','business'] },
    ]
  },
  {
    label: 'OTP Methods',
    items: [
      { href: '/api-keys',      icon: '🔑', label: 'API Keys',      plans: ['starter','growth','business','enterprise'] },
      { href: '/email-otp',     icon: '📧', label: 'Email OTP',     plans: ['starter','growth','business','enterprise'] },
      { href: '/sms-otp',       icon: '📱', label: 'SMS OTP',       plans: ['growth','business','enterprise'], locked: ['starter'] },
      { href: '/authenticator', icon: '🔐', label: 'Authenticator', plans: ['business','enterprise'], locked: ['starter','growth'] },
      { href: '/backup-codes',  icon: '🗝️', label: 'Backup Codes',  plans: ['business','enterprise'], locked: ['starter','growth'] },
    ]
  },
  {
    label: 'Settings',
    items: [
      { href: '/usage',      icon: '💳', label: 'Usage & Billing', plans: ['growth','business','enterprise'], locked: ['starter'] },
      { href: '/logs',       icon: '📋', label: 'Activity Logs',   plans: ['starter','growth','business','enterprise'] },
      { href: '/audit-logs', icon: '🔍', label: 'Audit Logs',      plans: ['enterprise'], locked: ['starter','growth','business'] },
      { href: '/branding',   icon: '🎨', label: 'Branding',        plans: ['business','enterprise'], locked: ['starter','growth'] },
      { href: '/settings',   icon: '⚙️', label: 'Settings',        plans: ['starter','growth','business','enterprise'] },
    ]
  }
]

function SidebarContent({ onClose, mobile }) {
  const location = useLocation()
  const { currentPlan } = useSubscription()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem', color: 'var(--heading)' }}>
          🔐 OTP<span style={{ color: 'var(--green)' }}>Guard</span>
        </Link>
        {mobile && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        )}
      </div>

      {/* Plan Badge */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
        <PlanBadge />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 20 }}>
            {group.label && (
              <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text)', letterSpacing: 1, padding: '0 10px', marginBottom: 6, textTransform: 'uppercase' }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const accessible = item.plans.includes(currentPlan)
              const locked = item.locked?.includes(currentPlan)
              const active = location.pathname === item.href

              return (
                <div key={item.href}>
                  {locked ? (
                    <div title={`Upgrade to unlock ${item.label}`} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                      borderRadius: 8, opacity: 0.45, cursor: 'not-allowed', marginBottom: 2,
                      color: 'var(--text)', fontSize: '.88rem',
                    }}>
                      <span>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: '.7rem' }}>🔒</span>
                    </div>
                  ) : (
                    <Link to={item.href} onClick={mobile ? onClose : undefined} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                      borderRadius: 8, textDecoration: 'none', marginBottom: 2, transition: 'all .15s',
                      background: active ? 'var(--green-dim)' : 'transparent',
                      color: active ? 'var(--green)' : 'var(--text)',
                      fontWeight: active ? 600 : 400, fontSize: '.88rem',
                      border: active ? '1px solid rgba(0,255,136,.2)' : '1px solid transparent',
                    }}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Upgrade CTA */}
      {currentPlan !== 'enterprise' && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <Link to="/#pricing" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px', borderRadius: 8, textDecoration: 'none', fontWeight: 600,
            fontSize: '.85rem', background: 'var(--green)', color: '#0a0e1a',
          }}>
            ↑ Upgrade Plan
          </Link>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop */}
      <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }} className="desktop-sidebar">
        <SidebarContent mobile={false} />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)' }} onClick={onClose} />
          <div style={{ position: 'relative', width: 240, zIndex: 201 }}>
            <SidebarContent mobile onClose={onClose} />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .desktop-sidebar { display: none !important; } }
      `}</style>
    </>
  )
}
