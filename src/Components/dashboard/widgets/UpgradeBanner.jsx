import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function UpgradeBanner({ title, description, features = [], ctaText, ctaLink, dismissible = false }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #1a2d4a)', border: '1px solid rgba(59,130,246,.3)', borderRadius: 12, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,255,136,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: '1.1rem' }}>✨</span>
              <h3 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '1rem' }}>{title}</h3>
            </div>
            <p style={{ fontSize: '.88rem', color: 'var(--text)', marginBottom: 14 }}>{description}</p>
            {features.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {features.map((f, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,.08)', color: 'var(--heading)', padding: '3px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600 }}>
                    ✓ {f}
                  </span>
                ))}
              </div>
            )}
            <Link to={ctaLink} className="btn-primary" style={{ padding: '10px 24px', fontSize: '.88rem' }}>{ctaText}</Link>
          </div>
          {dismissible && (
            <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>✕</button>
          )}
        </div>
      </div>
    </div>
  )
}
