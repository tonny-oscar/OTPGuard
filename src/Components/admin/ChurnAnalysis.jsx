import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

const alertColors = {
  danger: { bg: 'rgba(248,113,113,.08)', border: 'rgba(248,113,113,.3)', color: '#f87171' },
  warning: { bg: 'rgba(250,204,21,.08)', border: 'rgba(250,204,21,.3)', color: '#facc15' },
}

function ChurnAnalysis() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedTab, setExpandedTab] = useState('inactive')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/admin/churn/analysis`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        setData(json)
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
          📉 Churn Analysis
        </h1>
        <p style={{ fontSize: '.85rem' }}>Monitor user churn and identify at-risk customers</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : data ? (
        <div>
          {/* KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
              gap: 20,
              marginBottom: 28,
            }}
          >
            {[
              { icon: '📊', label: 'Churn Rate (30d)', val: `${data.churn_rate_30d}%`, color: 'var(--red)' },
              { icon: '⚠️', label: 'At-Risk Users', val: data.at_risk_users, color: '#facc15' },
              { icon: '🚪', label: 'Inactive (30d)', val: data.inactive_users_30d, color: '#f87171' },
              { icon: '📉', label: 'Churned Last 30d', val: data.churned_last_30d, color: '#f87171' },
            ].map((stat, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>
                  <span style={{ color: stat.color }}>{stat.val}</span>
                </div>
                <div style={{ fontSize: '.8rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Churn Trend */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}>Churn Trend (Last 4 Months)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
              {data.churn_trend.map((month, i) => {
                const maxChurned = Math.max(...data.churn_trend.map((m) => m.churned_users)) || 1
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${(month.churned_users / maxChurned) * 120}%`,
                        background: 'linear-gradient(180deg, #f87171, #facc15)',
                        borderRadius: '3px 3px 0 0',
                        minHeight: month.churned_users ? 3 : 0,
                      }}
                    />
                    <span style={{ fontSize: '.7rem', color: 'var(--text)', textAlign: 'center' }}>
                      {month.period.split('-')[0]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tabs for inactive and at-risk users */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[
                { id: 'inactive', label: '🚪 Inactive Users', count: data.inactive_users_30d },
                { id: 'at-risk', label: '⚠️ At-Risk Users', count: data.at_risk_users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setExpandedTab(tab.id)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: expandedTab === tab.id ? 'var(--green-dim)' : 'var(--border)',
                    color: expandedTab === tab.id ? 'var(--green)' : 'var(--text)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '.9rem',
                    transition: 'all .2s',
                  }}
                >
                  {tab.label}
                  <span
                    style={{
                      marginLeft: 8,
                      background: expandedTab === tab.id ? 'var(--green)' : 'var(--text)',
                      color: expandedTab === tab.id ? 'var(--surface)' : 'var(--bg)',
                      borderRadius: 12,
                      padding: '2px 8px',
                      fontSize: '.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Inactive Users Table */}
            {expandedTab === 'inactive' && data.inactive_users.length > 0 && (
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,.02)', borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Plan', 'Last Login', 'Days Inactive', 'Joined'].map((h) => (
                        <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.inactive_users.slice(0, 15).map((user, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 24px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{user.name || '—'}</div>
                          <div style={{ fontSize: '.75rem', marginTop: 2 }}>{user.email}</div>
                        </td>
                        <td style={{ padding: '12px 24px', textTransform: 'capitalize' }}>
                          <span
                            style={{
                              background: 'var(--green-dim)',
                              color: 'var(--green)',
                              borderRadius: 6,
                              padding: '2px 8px',
                              fontSize: '.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {user.plan}
                          </span>
                        </td>
                        <td style={{ padding: '12px 24px', fontSize: '.85rem' }}>
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </td>
                        <td style={{ padding: '12px 24px', fontWeight: 600, color: '#f87171' }}>
                          {user.days_inactive} days
                        </td>
                        <td style={{ padding: '12px 24px', fontSize: '.85rem' }}>
                          {new Date(user.joined).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* At-Risk Users Table */}
            {expandedTab === 'at-risk' && data.high_risk_users.length > 0 && (
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,.02)', borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Plan', 'Activity Decline', 'Last 30d', 'Prev 30d'].map((h) => (
                        <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.high_risk_users.slice(0, 15).map((user, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 24px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{user.email}</div>
                        </td>
                        <td style={{ padding: '12px 24px', textTransform: 'capitalize' }}>
                          <span
                            style={{
                              background: 'var(--green-dim)',
                              color: 'var(--green)',
                              borderRadius: 6,
                              padding: '2px 8px',
                              fontSize: '.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {user.plan}
                          </span>
                        </td>
                        <td style={{ padding: '12px 24px', fontWeight: 600, color: '#f87171' }}>
                          {user.activity_decline}%
                        </td>
                        <td style={{ padding: '12px 24px' }}>{user.logins_30d}</td>
                        <td style={{ padding: '12px 24px', color: 'var(--text)' }}>{user.logins_prev_30d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {expandedTab === 'inactive' && data.inactive_users.length === 0 && (
              <div style={{ ...card, textAlign: 'center', color: 'var(--text)' }}>
                ✅ No inactive users
              </div>
            )}

            {expandedTab === 'at-risk' && data.high_risk_users.length === 0 && (
              <div style={{ ...card, textAlign: 'center', color: 'var(--text)' }}>
                ✅ No at-risk users
              </div>
            )}
          </div>

          {/* Retention Tips */}
          <div style={{ ...card, marginTop: 20, background: alertColors.warning.bg, border: `1px solid ${alertColors.warning.border}` }}>
            <h3 style={{ color: alertColors.warning.color, fontWeight: 600, marginBottom: 12 }}>💡 Retention Recommendations</h3>
            <ul style={{ fontSize: '.85rem', color: 'var(--text)', paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Send re-engagement emails to inactive users</li>
              <li>Offer special promotions to at-risk customers</li>
              <li>Review pricing for users with declining activity</li>
              <li>Schedule personal check-ins with high-value accounts</li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ChurnAnalysis
