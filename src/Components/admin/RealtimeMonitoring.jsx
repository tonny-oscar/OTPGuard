import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
}

export default function RealtimeMonitoring() {
  const { token } = useAuth()
  const [realtime, setRealtime] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${API}/admin/realtime/dashboard`, { headers: h }).then(r => r.json()),
      fetch(`${API}/admin/realtime/activity-feed`, { headers: h }).then(r => r.json()),
    ]).then(([rt, af]) => {
      setRealtime(rt)
      setActivity(af.activity_feed || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [token])

  if (loading) return <Spinner />
  if (!realtime) return null

  const metrics = [
    { label: 'Online Users',       val: realtime.online_users ?? 0,           color: 'var(--green)' },
    { label: 'Active Sessions (1h)', val: realtime.active_sessions_1h ?? 0,   color: 'var(--blue)' },
    { label: 'Active Alerts',       val: realtime.alerts_active ?? 0,         color: '#f87171' },
    { label: 'System Status',       val: realtime.system_status ?? 'unknown', color: '#facc15' },
  ]

  return (
    <div>
      <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Real-Time Monitoring</h1>
      <p style={{ fontSize: '.85rem', marginBottom: 28, color: 'var(--text)' }}>
        Live system activity · Last updated {new Date(realtime.last_update).toLocaleTimeString()}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        {metrics.map(m => (
          <div key={m.label} style={card}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.val}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--text)' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 16 }}>Activity Feed (Last Hour)</h3>
        {activity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text)', opacity: .5 }}>No recent activity</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activity.map((ev, i) => (
              <div key={ev.id ?? i} style={{
                padding: '12px 16px', borderRadius: 8,
                background: ev.action?.includes('failed') ? 'rgba(248,113,113,.06)' : 'rgba(0,255,136,.04)',
                borderLeft: `3px solid ${ev.action?.includes('failed') ? '#f87171' : 'var(--green)'}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--heading)' }}>{ev.user}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text)', marginTop: 2 }}>
                    {ev.action} · {ev.method?.toUpperCase()} · {ev.ip}
                  </div>
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--text)', opacity: .7, flexShrink: 0 }}>
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
