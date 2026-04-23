import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function RevenueAnalytics() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/admin/revenue/dashboard`, {
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

  const progressBarStyles = (value, max) => {
    return {
      background: 'var(--border)',
      borderRadius: 4,
      height: 8,
      overflow: 'hidden',
      marginTop: 8,
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
          💰 Revenue Dashboard
        </h1>
        <p style={{ fontSize: '.85rem' }}>Monitor revenue metrics and subscription breakdown</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : data ? (
        <div>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
            {[
              { icon: '💵', label: 'Monthly Revenue', val: `$${data.total_monthly_revenue}`, change: '+12%' },
              { icon: '🎯', label: 'Revenue Target', val: `$${data.monthly_revenue_target}`, pct: Math.round((data.total_monthly_revenue / data.monthly_revenue_target) * 100) },
              { icon: '👥', label: 'Active Subscriptions', val: data.total_subscriptions, sub: `${data.paying_subscriptions} paying` },
              { icon: '📊', label: 'ARPU', val: `$${data.avg_revenue_per_user}`, sub: 'Average per user' },
            ].map((stat, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 4 }}>
                  {stat.val}
                </div>
                {stat.change && (
                  <div style={{ fontSize: '.75rem', color: 'var(--green)', fontWeight: 600 }}>
                    {stat.change}
                  </div>
                )}
                {stat.sub && <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 4 }}>{stat.sub}</div>}
                {stat.pct && (
                  <div style={{ ...progressBarStyles(), marginTop: 8 }}>
                    <div
                      style={{
                        width: `${Math.min(stat.pct, 100)}%`,
                        height: '100%',
                        background: 'var(--green)',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Plan Breakdown */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}>Plan Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.plan_breakdown.map((plan) => (
                <div key={plan.plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{plan.plan}</span>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>{plan.percentage}%</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${plan.percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--blue), var(--green))',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '.75rem', marginTop: 6, color: 'var(--text)' }}>
                    {plan.users} users × ${plan.price}/mo = ${plan.revenue}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Trend */}
          <div style={{ ...card, marginTop: 20 }}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}>Revenue Trend (Last 7 Days)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
              {data.revenue_trend_7d.map((day, i) => {
                const maxRevenue = Math.max(...data.revenue_trend_7d.map((d) => d.revenue))
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${(day.revenue / (maxRevenue || 1)) * 120}%`,
                        background: 'linear-gradient(180deg, var(--green), var(--blue))',
                        borderRadius: '3px 3px 0 0',
                        minHeight: day.revenue ? 3 : 0,
                        tooltip: `$${day.revenue}`,
                      }}
                    />
                    <span style={{ fontSize: '.7rem', color: 'var(--text)' }}>{day.day}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: '.75rem', color: 'var(--text)', textAlign: 'center' }}>
              7-day revenue trend
            </div>
          </div>

          {/* Subscription Health */}
          <div style={{ ...card, marginTop: 20 }}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}>Subscription Health</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
              <div>
                <div style={{ fontSize: '.9rem', marginBottom: 8, fontWeight: 500 }}>Trial Users</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue)' }}>{data.trial_subscriptions}</div>
                <div style={{ fontSize: '.75rem', marginTop: 4, color: 'var(--text)' }}>
                  {Math.round(
                    (data.trial_subscriptions / (data.total_subscriptions || 1)) * 100
                  )}% of total
                </div>
              </div>
              <div>
                <div style={{ fontSize: '.9rem', marginBottom: 8, fontWeight: 500 }}>Paying Users</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>{data.paying_subscriptions}</div>
                <div style={{ fontSize: '.75rem', marginTop: 4, color: 'var(--text)' }}>
                  {Math.round(
                    (data.paying_subscriptions / (data.total_subscriptions || 1)) * 100
                  )}% of total
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default RevenueAnalytics
