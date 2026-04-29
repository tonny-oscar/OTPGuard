import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function SystemHealth() {
  const { token } = useAuth()
  const [health, setHealth] = useState(null)
  const [perf, setPerf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [healthRes, perfRes] = await Promise.all([
          fetch(`${API}/admin/health/system`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/admin/health/performance`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setHealth(await healthRes.json())
        setPerf(await perfRes.json())
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
           System Health & Performance
        </h1>
        <p style={{ fontSize: '.85rem' }}>Monitor system status and performance metrics</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : health ? (
        <div>
          {/* Status Overview */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: 'var(--heading)', fontWeight: 600 }}>System Status</h2>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: 'rgba(0,255,136,.1)',
                borderRadius: 20,
                color: 'var(--green)',
                fontWeight: 700,
              }}>
                <span style={{ width: 8, height: 8, background: 'var(--green)', borderRadius: '50%' }} />
                Operational
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
              {[
                { icon: '⬆️', label: 'Uptime', val: `${health.uptime_percentage}%` },
                { icon: '⚡', label: 'Avg Response Time', val: `${health.api_response_time_ms}ms` },
                { icon: '❌', label: 'Error Rate', val: `${health.error_rate_percent}%` },
                { icon: '', label: 'Database Size', val: `${health.database_size_mb}MB` },
              ].map((stat, i) => (
                <div key={i} style={{ padding: 16, background: 'rgba(0,255,136,.05)', borderRadius: 8 }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: '.85rem', marginBottom: 4, color: 'var(--text)' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stat.val}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: '.85rem', color: 'var(--text)' }}>
              Last backup: {new Date(health.last_backup).toLocaleString()}
            </div>
          </div>

          {/* Performance Metrics */}
          {perf && (
            <div style={{ ...card, marginTop: 20 }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}> 7-Day Performance Trend</h3>

              {/* Response Time Chart */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '.9rem', fontWeight: 600, marginBottom: 12 }}>API Response Time (ms)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                  {perf.performance_trend.map((day, i) => {
                    const maxRt = Math.max(...perf.performance_trend.map((d) => d.avg_response_time))
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div
                          style={{
                            width: '100%',
                            height: `${(day.avg_response_time / maxRt) * 100}%`,
                            background: 'linear-gradient(180deg, var(--blue), var(--green))',
                            borderRadius: '3px 3px 0 0',
                            minHeight: 3,
                          }}
                        />
                        <span style={{ fontSize: '.7rem', color: 'var(--text)' }}>{day.day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Error Rate Chart */}
              <div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, marginBottom: 12 }}>Error Rate (%)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
                  {perf.performance_trend.map((day, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div
                        style={{
                          width: '100%',
                          height: `${day.error_rate * 10}%`,
                          background: day.error_rate > 2 ? '#f87171' : day.error_rate > 1 ? '#facc15' : 'var(--green)',
                          borderRadius: '3px 3px 0 0',
                          minHeight: 2,
                        }}
                      />
                      <span style={{ fontSize: '.7rem', color: 'var(--text)' }}>{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Data Stats */}
          <div style={{ ...card, marginTop: 20 }}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}> Data Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: '.85rem', marginBottom: 4, color: 'var(--text)' }}>Total Records</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{health.total_records.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '.85rem', marginBottom: 4, color: 'var(--text)' }}>Total Users</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{health.total_users}</div>
              </div>
              <div>
                <div style={{ fontSize: '.85rem', marginBottom: 4, color: 'var(--text)' }}>Active Devices</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{health.total_devices}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SystemHealth

