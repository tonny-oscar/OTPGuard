import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }

export default function SystemHealth() {
  const { token } = useAuth()
  const [health, setHealth] = useState(null)
  const [perf, setPerf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${API}/admin/health/system`, { headers: h }).then(r => r.json()),
      fetch(`${API}/admin/health/performance`, { headers: h }).then(r => r.json()),
    ]).then(([hl, pf]) => {
      setHealth(hl)
      setPerf(pf)
    }).catch(console.error).finally(() => setLoading(false))
  }, [token])

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
  if (!health) return null

  const statusColor = health.status === 'operational' ? 'var(--green)' : '#facc15'

  return (
    <div>
      <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>System Health</h1>
      <p style={{ fontSize: '.85rem', marginBottom: 28, color: 'var(--text)' }}>Monitor system status and performance metrics</p>

      {/* Status banner */}
      <div style={{ ...card, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--heading)', marginBottom: 4 }}>Overall Status</div>
          <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>
            Last backup: {health.last_backup ? new Date(health.last_backup).toLocaleString() : 'N/A'}
          </div>
        </div>
        <span style={{
          padding: '6px 16px', borderRadius: 20, fontWeight: 700, fontSize: '.85rem',
          background: health.status === 'operational' ? 'rgba(0,255,136,.12)' : 'rgba(250,204,21,.12)',
          color: statusColor, border: `1px solid ${statusColor}40`,
        }}>
          ● {health.status?.toUpperCase()}
        </span>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Uptime',         val: `${health.uptime_percentage}%`,      color: 'var(--green)' },
          { label: 'Avg Response',   val: `${health.api_response_time_ms}ms`,  color: 'var(--blue)' },
          { label: 'Error Rate',     val: `${health.error_rate_percent}%`,     color: health.error_rate_percent > 5 ? '#f87171' : 'var(--green)' },
          { label: 'DB Size',        val: `${health.database_size_mb}MB`,      color: '#facc15' },
          { label: 'Total Records',  val: health.total_records?.toLocaleString(), color: 'var(--heading)' },
          { label: 'Total Users',    val: health.total_users,                  color: 'var(--heading)' },
          { label: 'Active Devices', val: health.total_devices,                color: 'var(--heading)' },
        ].map(m => (
          <div key={m.label} style={card}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.val}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text)' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Performance trend */}
      {perf?.performance_trend?.length > 0 && (
        <div style={card}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 20 }}>7-Day Performance Trend</h3>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '.85rem', fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>Response Time (ms)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
              {perf.performance_trend.map((d, i) => {
                const max = Math.max(...perf.performance_trend.map(x => x.avg_response_time), 1)
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: `${(d.avg_response_time / max) * 90}%`, background: 'var(--blue)', borderRadius: '3px 3px 0 0', minHeight: 3 }} />
                    <span style={{ fontSize: '.68rem', color: 'var(--text)' }}>{d.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '.85rem', fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>Error Rate (%)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {perf.performance_trend.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: `${Math.max(d.error_rate * 10, 2)}%`, background: d.error_rate > 2 ? '#f87171' : 'var(--green)', borderRadius: '3px 3px 0 0' }} />
                  <span style={{ fontSize: '.68rem', color: 'var(--text)' }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
