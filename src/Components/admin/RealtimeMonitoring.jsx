import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function RealtimeMonitoring() {
  const { token } = useAuth()
  const [realtime, setRealtime] = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [realtimeRes, activityRes] = await Promise.all([
          fetch(`${API}/admin/realtime/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/admin/realtime/activity-feed`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setRealtime(await realtimeRes.json())
        setActivity(await activityRes.json())
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
          🔴 Real-Time Monitoring
        </h1>
        <p style={{ fontSize: '.85rem' }}>Live system activity and user engagement</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : realtime ? (
        <div>
          {/* Live Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
            {[
              { icon: '👥', label: 'Online Users', val: realtime.online_users, color: 'var(--green)' },
              { icon: '📱', label: 'Active Sessions', val: realtime.active_sessions, color: 'var(--blue)' },
              { icon: '⚡', label: 'Requests/Min', val: realtime.requests_per_minute, color: '#fbbf24' },
              { icon: '⚠️', label: 'Alerts', val: realtime.alerts_count, color: '#f87171' },
            ].map((stat, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.val}</div>
                <div style={{ fontSize: '.8rem', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* System Status */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>🟢 System Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16 }}>
              {Object.entries(realtime.system_status).map(([service, status]) => (
                <div key={service} style={{ padding: 16, background: 'rgba(0,255,136,.05)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: status.operational ? 'var(--green)' : '#f87171',
                        marginRight: 8,
                      }}
                    />
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{service}</div>
                  </div>
                  <div style={{ fontSize: '.85rem', color: 'var(--text)', marginBottom: 8 }}>
                    Uptime: {status.uptime}% • Response: {status.response_time}ms
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>
                    {status.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          {activity && (
            <div style={{ ...card, marginTop: 20 }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>📋 Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activity.activity_feed.map((event, i) => (
                  <div key={i} style={{ padding: 16, background: 'rgba(59,130,246,.05)', borderRadius: 8, borderLeft: '4px solid var(--blue)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, flex: 1 }}>{event.event_type}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '.9rem', marginBottom: 4, color: 'var(--text)' }}>
                      User: <span style={{ fontFamily: 'monospace' }}>{event.user_email}</span>
                    </div>
                    <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>
                      {event.details}
                    </div>
                    {event.ip_address && (
                      <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 8 }}>
                        IP: {event.ip_address} • Device: {event.device_type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div style={{ ...card, marginTop: 20 }}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>📊 Performance Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
              {[
                { label: 'Avg Response Time', value: `${realtime.avg_response_time}ms`, trend: 'normal' },
                { label: 'Error Rate', value: `${realtime.error_rate}%`, trend: realtime.error_rate > 5 ? 'warning' : 'normal' },
                { label: 'CPU Usage', value: `${realtime.cpu_usage}%`, trend: realtime.cpu_usage > 80 ? 'warning' : 'normal' },
                { label: 'Memory Usage', value: `${realtime.memory_usage}%`, trend: realtime.memory_usage > 80 ? 'warning' : 'normal' },
              ].map((metric, i) => (
                <div key={i} style={{ padding: 16, background: 'rgba(250,204,21,.05)', borderRadius: 8 }}>
                  <div style={{ fontSize: '.85rem', marginBottom: 8, fontWeight: 500 }}>{metric.label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4, color: metric.trend === 'warning' ? '#f87171' : 'var(--heading)' }}>
                    {metric.value}
                  </div>
                  <div style={{ fontSize: '.75rem', color: metric.trend === 'warning' ? '#f87171' : 'var(--green)' }}>
                    {metric.trend === 'warning' ? '⚠️ Elevated' : '✓ Normal'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default RealtimeMonitoring
