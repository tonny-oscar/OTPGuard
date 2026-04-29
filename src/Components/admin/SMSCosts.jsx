import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function SMSCosts() {
  const { token } = useAuth()
  const [costs, setCosts] = useState(null)
  const [breakdown, setBreakdown] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [costsRes, breakdownRes] = await Promise.all([
          fetch(`${API}/admin/costs/sms`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/admin/costs/breakdown`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setCosts(await costsRes.json())
        setBreakdown(await breakdownRes.json())
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
           SMS & Communication Costs
        </h1>
        <p style={{ fontSize: '.85rem' }}>Track and optimize communication expenses</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : costs ? (
        <div>
          {/* Cost Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
            {[
              { icon: '', label: 'SMS Count (30d)', val: costs.sms_count, sub: `$${costs.sms_cost_per_unit}/SMS` },
              { icon: '', label: 'SMS Cost', val: `$${costs.sms_cost}`, color: 'var(--blue)' },
              { icon: '', label: 'Email Count (30d)', val: costs.email_count, sub: `$${costs.email_cost_per_unit}/Email` },
              { icon: '', label: 'Total Cost', val: `$${costs.total_communication_cost}`, color: '#facc15' },
            ].map((stat, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color || 'var(--heading)' }}>{stat.val}</div>
                <div style={{ fontSize: '.75rem', marginTop: 4, color: 'var(--text)' }}>
                  {stat.label}
                </div>
                {stat.sub && <div style={{ fontSize: '.7rem', marginTop: 4, color: 'var(--text)' }}>{stat.sub}</div>}
              </div>
            ))}
          </div>

          {/* Cost Per User */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 12 }}> Cost Per User (30d)</h3>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--green)', marginBottom: 8 }}>
              ${costs.cost_by_user}
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>
              Average communication cost per active user
            </div>
          </div>

          {/* Breakdown by Plan */}
          {breakdown && (
            <div style={{ ...card, marginTop: 20 }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}> Cost Breakdown by Plan</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Plan</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Users</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Total Cost</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Per User</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.cost_breakdown.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{item.plan}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{item.users}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--blue)' }}>
                        ${item.total_cost}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--green)' }}>
                        ${item.avg_cost_per_user}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recommendations */}
          <div style={{ ...card, marginTop: 20, background: 'rgba(59,130,246,.05)', borderColor: 'rgba(59,130,246,.2)' }}>
            <h3 style={{ color: 'var(--blue)', fontWeight: 600, marginBottom: 12 }}> Cost Optimization Tips</h3>
            <ul style={{ fontSize: '.85rem', color: 'var(--text)', paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Encourage email-based OTP to reduce SMS costs</li>
              <li>Monitor plans with high per-user SMS costs</li>
              <li>Consider bulk SMS discounts if volume increases</li>
              <li>Optimize delivery retry logic to reduce failed attempts</li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SMSCosts

