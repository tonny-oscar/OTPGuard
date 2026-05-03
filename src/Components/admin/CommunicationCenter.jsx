import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function CommunicationCenter() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/admin/communications/delivery`, {
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
           Communication Center
        </h1>
        <p style={{ fontSize: '.85rem' }}>Monitor email and SMS delivery</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : data ? (
        <div>
          {/* Email Stats */}
          <div style={{ ...card, marginBottom: 20 }}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}> Email Delivery</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              <div style={{ padding: 16, background: 'var(--blue-dim)', borderRadius: 8 }}>
                <div style={{ fontSize: '.85rem', marginBottom: 8, color: 'var(--text)' }}>Emails Sent</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue)' }}>{data.email_sent}</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(0,255,136,.05)', borderRadius: 8 }}>
                <div style={{ fontSize: '.85rem', marginBottom: 8, color: 'var(--text)' }}>Delivered</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>{data.email_delivered}</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(0,255,136,.05)', borderRadius: 8 }}>
                <div style={{ fontSize: '.85rem', marginBottom: 8, color: 'var(--text)' }}>Delivery Rate</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>{data.email_delivery_rate}%</div>
              </div>
            </div>
          </div>

          {/* SMS Stats */}
          <div style={{ ...card, marginBottom: 20 }}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}> SMS Delivery</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              <div style={{ padding: 16, background: 'var(--blue-dim)', borderRadius: 8 }}>
                <div style={{ fontSize: '.85rem', marginBottom: 8, color: 'var(--text)' }}>SMS Sent</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue)' }}>{data.sms_sent}</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(0,255,136,.05)', borderRadius: 8 }}>
                <div style={{ fontSize: '.85rem', marginBottom: 8, color: 'var(--text)' }}>Delivered</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>{data.sms_delivered}</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(0,255,136,.05)', borderRadius: 8 }}>
                <div style={{ fontSize: '.85rem', marginBottom: 8, color: 'var(--text)' }}>Delivery Rate</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>{data.sms_delivery_rate}%</div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>⚡ Delivery Performance</h3>
            <div style={{ padding: 16, background: 'rgba(59,130,246,.05)', borderRadius: 8 }}>
              <div style={{ fontSize: '.9rem', marginBottom: 8 }}>Average Delivery Time</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue)' }}>
                {data.avg_delivery_time_ms}ms
              </div>
              <div style={{ fontSize: '.75rem', marginTop: 8, color: 'var(--text)' }}>Typical latency for communication delivery</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CommunicationCenter

