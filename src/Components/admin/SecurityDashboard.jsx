import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function SecurityDashboard() {
  const { token } = useAuth()
  const [threats, setThreats] = useState(null)
  const [mfa, setMfa] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [threatsRes, mfaRes] = await Promise.all([
          fetch(`${API}/admin/security/threats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/admin/security/mfa-status`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setThreats(await threatsRes.json())
        setMfa(await mfaRes.json())
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
          🔒 Security & Threats
        </h1>
        <p style={{ fontSize: '.85rem' }}>Monitor security threats and MFA adoption</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : threats ? (
        <div>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
            {[
              { icon: '❌', label: 'Failed Logins (24h)', val: threats.failed_logins_24h, color: '#f87171' },
              { icon: '⚠️', label: 'Failed Logins (7d)', val: threats.failed_logins_7d, color: '#facc15' },
              { icon: '🚨', label: 'Brute Force Attempts', val: threats.brute_force_attempts, color: '#f87171' },
              { icon: '🔐', label: 'MFA Enforcement', val: `${threats.mfa_enforcement_rate}%`, color: 'var(--green)' },
            ].map((stat, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.val}</div>
                <div style={{ fontSize: '.8rem', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Suspicious IPs */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>🚨 Suspicious IPs (7d)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {threats.suspicious_ips.slice(0, 5).map((ip, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(248,113,113,.05)', borderRadius: 6 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{ip.ip}</span>
                  <span style={{ color: '#f87171', fontWeight: 700 }}>{ip.attempts} attempts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brute Force */}
          {threats.brute_force_ips.length > 0 && (
            <div style={{ ...card, marginTop: 20, background: 'rgba(248,113,113,.08)' }}>
              <h3 style={{ color: '#f87171', fontWeight: 600, marginBottom: 16 }}>🔴 Active Brute Force Attacks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {threats.brute_force_ips.map((ip, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(248,113,113,.1)', borderRadius: 6, borderLeft: '3px solid #f87171' }}>
                    <span style={{ fontFamily: 'monospace' }}>{ip.ip}</span>
                    <span style={{ fontWeight: 700 }}>{ip.attempts} attempts (last hour)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MFA by Plan */}
          {mfa && (
            <div style={{ ...card, marginTop: 20 }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>📊 MFA Adoption by Plan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16 }}>
                {mfa.mfa_by_plan.map((plan) => (
                  <div key={plan.plan} style={{ padding: 16, background: 'rgba(0,255,136,.05)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>{plan.plan}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '.85rem' }}>MFA Users</span>
                      <span style={{ fontWeight: 700, color: 'var(--green)' }}>{plan.mfa_users}/{plan.total_users}</span>
                    </div>
                    <div style={{ background: 'var(--border)', borderRadius: 4, height: 8 }}>
                      <div style={{ width: `${plan.mfa_rate}%`, height: '100%', background: 'var(--green)', borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: '.75rem', marginTop: 8, color: 'var(--text)' }}>{plan.mfa_rate}% adoption</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default SecurityDashboard
