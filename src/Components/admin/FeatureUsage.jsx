import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function FeatureUsage() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/admin/features/usage`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setData(await res.json())
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
          🎮 Feature Usage Analytics
        </h1>
        <p style={{ fontSize: '.85rem' }}>Track feature adoption and usage patterns</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : data ? (
        <div>
          {/* Features Overview */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}>📊 Feature Adoption Rates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(data.features).map(([key, feature]) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>{feature.name}</span>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>{feature.adoption}%</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 8 }}>
                    <div
                      style={{
                        width: `${feature.adoption}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--blue), var(--green))',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Plan */}
          <div style={{ ...card, marginTop: 20 }}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}>📈 Adoption by Plan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16 }}>
              {Object.entries(data.by_plan).map(([plan, info]) => (
                <div key={plan} style={{ padding: 16, background: 'rgba(0,255,136,.05)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, textTransform: 'capitalize' }}>{plan}</div>
                  <div style={{ fontSize: '.85rem', marginBottom: 8 }}>
                    <div>Features: {info.available.length}</div>
                    <div style={{ fontWeight: 700, color: 'var(--green)', marginTop: 4 }}>Adoption: {info.adoption_rate}%</div>
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

export default FeatureUsage
