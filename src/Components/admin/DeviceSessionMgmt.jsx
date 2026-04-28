import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function DeviceSessionMgmt() {
  const { token } = useAuth()
  const [sessions, setSessions] = useState(null)
  const [geo, setGeo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [sessionsRes, geoRes] = await Promise.all([
          fetch(`${API}/admin/sessions/active`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/admin/devices/geo-distribution`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setSessions(await sessionsRes.json())
        setGeo(await geoRes.json())
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
          📱 Device & Session Management
        </h1>
        <p style={{ fontSize: '.85rem' }}>Monitor active devices and user sessions</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : sessions ? (
        <div>
          {/* Session Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
            {[
              { icon: '👥', label: 'Active Users', val: sessions.online_users, color: 'var(--green)' },
              { icon: '📱', label: 'Active Devices', val: sessions.active_devices, color: 'var(--blue)' },
              { icon: '⏱️', label: 'Sessions (24h)', val: sessions.total_sessions_24h, color: '#facc15' },
              { icon: '⌚', label: 'Avg Session Duration', val: `${sessions.avg_session_duration_minutes}m`, color: 'var(--green)' },
            ].map((stat, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.val}</div>
                <div style={{ fontSize: '.8rem', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Device Distribution */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>📊 Device Type Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(sessions.device_distribution).map(([type, count]) => {
                const total = Object.values(sessions.device_distribution).reduce((a, b) => a + b, 0)
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{type}</span>
                      <span style={{ color: 'var(--green)', fontWeight: 700 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ background: 'var(--border)', borderRadius: 4, height: 8 }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--blue), var(--green))',
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Geographic Distribution */}
          {geo && (
            <div style={{ ...card, marginTop: 20 }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>🌍 Geographic Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {geo.geographic_distribution.slice(0, 5).map((loc, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{loc.location}</span>
                      <span style={{ color: 'var(--text)' }}>
                        {loc.devices} devices ({loc.percentage}%)
                      </span>
                    </div>
                    <div style={{ background: 'var(--border)', borderRadius: 4, height: 6 }}>
                      <div
                        style={{
                          width: `${loc.percentage}%`,
                          height: '100%',
                          background: 'var(--green)',
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div style={{ ...card, marginTop: 20, background: 'rgba(59,130,246,.05)', borderColor: 'rgba(59,130,246,.2)' }}>
            <h3 style={{ color: 'var(--blue)', fontWeight: 600, marginBottom: 12 }}>🔒 Session Security</h3>
            <ul style={{ fontSize: '.85rem', color: 'var(--text)', paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Expired sessions are automatically terminated</li>
              <li>Suspicious device activity is monitored</li>
              <li>Device fingerprints are verified for security</li>
              <li>Geographic anomalies trigger alerts</li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DeviceSessionMgmt
