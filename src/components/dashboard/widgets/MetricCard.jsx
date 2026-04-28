const colorMap = {
  blue:    { bg: 'rgba(59,130,246,.12)',  color: '#60a5fa' },
  green:   { bg: 'var(--green-dim)',      color: 'var(--green)' },
  purple:  { bg: 'rgba(139,92,246,.12)', color: '#a78bfa' },
  indigo:  { bg: 'rgba(99,102,241,.12)', color: '#818cf8' },
  emerald: { bg: 'rgba(16,185,129,.12)', color: '#34d399' },
  amber:   { bg: 'rgba(245,158,11,.12)', color: '#fbbf24' },
}

export default function MetricCard({ title, value, icon, trend, trendUp, subtitle, progressBar, badge, color = 'blue' }) {
  const c = colorMap[color] || colorMap.blue

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '.82rem', color: 'var(--text)' }}>{title}</span>
            {badge && (
              <span style={{ background: 'rgba(59,130,246,.15)', color: '#60a5fa', padding: '1px 8px', borderRadius: 10, fontSize: '.7rem', fontWeight: 700 }}>{badge}</span>
            )}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 4 }}>{value}</div>
          {subtitle && <div style={{ fontSize: '.78rem', color: 'var(--text)' }}>{subtitle}</div>}
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <span style={{ fontSize: '.75rem' }}>{trendUp ? '↑' : '↓'}</span>
              <span style={{ fontSize: '.78rem', color: trendUp ? 'var(--green)' : '#f87171', fontWeight: 600 }}>{trend}</span>
            </div>
          )}
          {progressBar !== undefined && (
            <div style={{ marginTop: 10, background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(progressBar, 100)}%`, height: '100%', borderRadius: 4,
                background: progressBar > 80 ? '#f87171' : progressBar > 50 ? '#facc15' : 'var(--green)',
              }} />
            </div>
          )}
        </div>
        {icon && (
          <div style={{ background: c.bg, color: c.color, padding: 10, borderRadius: 10, fontSize: '1.3rem', flexShrink: 0 }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
