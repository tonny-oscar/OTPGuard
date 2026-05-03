import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function PlanAnalytics() {
  const { token } = useAuth()
  const [plans, setPlans] = useState(null)
  const [movements, setMovements] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [plansRes, movementsRes] = await Promise.all([
          fetch(`${API}/admin/plans/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/admin/plans/upgrade-downgrade`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setPlans(await plansRes.json())
        setMovements(await movementsRes.json())
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
           Plan Analytics
        </h1>
        <p style={{ fontSize: '.85rem' }}>Analyze subscription plan distribution and performance</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : plans ? (
        <div>
          {/* Plan Distribution Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
            {plans.plans.map((plan) => (
              <div key={plan.name} style={card}>
                <div style={{ fontSize: '.9rem', fontWeight: 600, marginBottom: 12, textTransform: 'capitalize' }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 8 }}>
                  {plan.user_count}
                </div>
                <div style={{ fontSize: '.85rem', marginBottom: 12 }}>Active Users</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '.75rem', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Growth</span>
                    <span style={{ color: plan.growth_percentage >= 0 ? 'var(--green)' : '#f87171' }}>
                      {plan.growth_percentage >= 0 ? '' : ''} {Math.abs(plan.growth_percentage)}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(plan.growth_percentage + 50, 100)}%`,
                        background: plan.growth_percentage >= 0 ? 'var(--green)' : '#f87171',
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>
                  Revenue: ${plan.total_revenue} | Avg: ${plan.average_spending}
                </div>
              </div>
            ))}
          </div>

          {/* Plan Metrics Table */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}> Plan Performance Metrics</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Plan</th>
                    <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Users</th>
                    <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Growth</th>
                    <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Churn</th>
                    <th style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>Avg Spend</th>
                    <th style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.plans.map((plan) => (
                    <tr key={plan.name} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: 12, fontWeight: 600, textTransform: 'capitalize' }}>{plan.name}</td>
                      <td style={{ padding: 12, textAlign: 'center' }}>{plan.user_count}</td>
                      <td style={{ padding: 12, textAlign: 'center', color: plan.growth_percentage >= 0 ? 'var(--green)' : '#f87171' }}>
                        {plan.growth_percentage >= 0 ? '+' : ''}{plan.growth_percentage}%
                      </td>
                      <td style={{ padding: 12, textAlign: 'center', color: '#f87171' }}>{plan.churn_percentage}%</td>
                      <td style={{ padding: 12, textAlign: 'right' }}>${plan.average_spending}</td>
                      <td style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: 'var(--green)' }}>
                        ${plan.total_revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upgrade/Downgrade Activity */}
          {movements && (
            <div style={{ ...card, marginTop: 20 }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}> Plan Movements</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                {Object.entries(movements.upgrade_downgrade).map(([period, data]) => (
                  <div key={period} style={{ padding: 16, background: 'rgba(59,130,246,.05)', borderRadius: 8 }}>
                    <div style={{ fontSize: '.9rem', marginBottom: 4, fontWeight: 600, textTransform: 'capitalize' }}>
                      {period}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
                      <span style={{ color: 'var(--green)' }}>↑ {data.upgrades}</span>
                      {' / '}
                      <span style={{ color: '#f87171' }}>↓ {data.downgrades}</span>
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>
                      Net: {data.upgrades - data.downgrades > 0 ? '+' : ''}{data.upgrades - data.downgrades}
                    </div>
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

export default PlanAnalytics

