import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function PromotionsManager() {
  const { token } = useAuth()
  const [promos, setPromos] = useState(null)
  const [trial, setTrial] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [promosRes, trialRes] = await Promise.all([
          fetch(`${API}/admin/promotions/overview`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/admin/promotions/trial-conversion`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setPromos(await promosRes.json())
        setTrial(await trialRes.json())
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
          🎁 Promotions & Discounts
        </h1>
        <p style={{ fontSize: '.85rem' }}>Manage and track promotional campaigns</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : promos ? (
        <div>
          {/* Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
            {[
              { icon: '🎯', label: 'Active Promotions', val: promos.active_promotions },
              { icon: '👥', label: 'Users with Discounts', val: promos.total_users_with_discounts },
              { icon: '💰', label: 'Total Discount Value', val: `$${promos.total_discount_value}` },
              { icon: '📈', label: 'Conversion Rate', val: trial ? `${trial.conversion_rate}%` : 'N/A' },
            ].map((stat, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)' }}>{stat.val}</div>
                <div style={{ fontSize: '.8rem', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Active Promotions */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>📋 Active Promotion Codes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {promos.promotions.map((promo) => (
                <div key={promo.id} style={{ padding: 16, background: 'rgba(0,255,136,.05)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem' }}>{promo.code}</div>
                    <div style={{ color: 'var(--green)', fontWeight: 700 }}>-{promo.discount}%</div>
                  </div>
                  <div style={{ fontSize: '.85rem', color: 'var(--text)', marginBottom: 8 }}>
                    Used: {promo.usage_count} times | Discount value: ${promo.total_discount_value}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>
                    Created: {new Date(promo.created).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trial Conversion */}
          {trial && (
            <div style={{ ...card, marginTop: 20 }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>🎓 Trial Conversion Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16 }}>
                <div style={{ padding: 16, background: 'rgba(59,130,246,.05)', borderRadius: 8 }}>
                  <div style={{ fontSize: '.9rem', marginBottom: 8, fontWeight: 600 }}>Total Trial Users</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue)' }}>{trial.total_trial_users}</div>
                </div>
                <div style={{ padding: 16, background: 'rgba(0,255,136,.05)', borderRadius: 8 }}>
                  <div style={{ fontSize: '.9rem', marginBottom: 8, fontWeight: 600 }}>Converted</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>{trial.converted_users}</div>
                </div>
                <div style={{ padding: 16, background: 'rgba(250,204,21,.05)', borderRadius: 8 }}>
                  <div style={{ fontSize: '.9rem', marginBottom: 8, fontWeight: 600 }}>Conversion Rate</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#facc15' }}>{trial.conversion_rate}%</div>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: 12, background: 'rgba(248,113,113,.05)', borderRadius: 6, fontSize: '.85rem', color: '#f87171' }}>
                ⚠️ {trial.trial_expiring_soon} trials expiring soon
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default PromotionsManager
