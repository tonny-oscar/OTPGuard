import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'
import { generatePDF, pdfKpiGrid, pdfTable, pdfSection } from '../../utils/pdfExport'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function BillingReport() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/admin/billing/usage-report?days=${days}`, {
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
  }, [days, token])

  function exportPDF() {
    if (!data) return
    const html =
      pdfSection('Summary', pdfKpiGrid([
        { val: data.total_active_users,   label: 'Active Users' },
        { val: data.total_otp_operations, label: 'Total OTP Operations' },
        { val: Math.round(data.total_otp_operations / (data.total_active_users || 1)), label: 'Avg Ops / User' },
      ])) +
      pdfSection('Per-User Usage', pdfTable(
        ['User', 'Email', 'Plan', 'Logins', 'Failed', 'Success %', 'Primary Method'],
        data.users.map(u => [
          u.name || '—',
          u.email,
          `<span class="badge badge-green">${u.plan}</span>`,
          u.total_logins,
          `<span class="badge badge-red">${u.failed_logins}</span>`,
          `<span class="badge badge-green">${u.success_rate}%</span>`,
          u.usage_by_method.length > 0
            ? u.usage_by_method.reduce((a, b) => a.count > b.count ? a : b).method
            : 'N/A',
        ])
      ))
    generatePDF('Billing & Usage Report', html, `Last ${days} days · ${data.total_active_users} active users`)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
            💳 Billing & Usage Reports
          </h1>
          <p style={{ fontSize: '.85rem' }}>Detailed usage and billing analysis for all users</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', outline: 'none' }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={exportPDF} disabled={!data} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: data ? 'var(--green)' : 'var(--border)',
            color: data ? '#0a0e1a' : 'var(--text)',
            fontWeight: 700, cursor: data ? 'pointer' : 'not-allowed', fontSize: '.85rem',
          }}>
            📄 Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : data ? (
        <div>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
            {[
              { icon: '👥', label: 'Active Users', val: data.total_active_users },
              { icon: '📊', label: 'Total OTP Operations', val: data.total_otp_operations },
              { icon: '📈', label: 'Avg Ops/User', val: Math.round(data.total_otp_operations / (data.total_active_users || 1)) },
            ].map((stat) => (
              <div key={stat.label} style={card}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)' }}>{stat.val}</div>
                <div style={{ fontSize: '.8rem', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Users table */}
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 24, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600 }}>Per-User Usage</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,.02)', borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Plan', 'Logins', 'Failed', 'Success %', 'Primary Method'].map((h) => (
                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.users.slice(0, 20).map((user) => {
                  const primaryMethod =
                    user.usage_by_method.length > 0
                      ? user.usage_by_method.reduce((a, b) => (a.count > b.count ? a : b)).method
                      : 'N/A'
                  return (
                    <tr key={user.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
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
                      <td style={{ padding: '12px 24px' }}>{user.total_logins}</td>
                      <td style={{ padding: '12px 24px' }}>
                        <span style={{ color: '#f87171' }}>{user.failed_logins}</span>
                      </td>
                      <td style={{ padding: '12px 24px', fontWeight: 600, color: 'var(--green)' }}>
                        {user.success_rate}%
                      </td>
                      <td style={{ padding: '12px 24px', textTransform: 'capitalize' }}>{primaryMethod}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {data.users.length > 20 && (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--text)', fontSize: '.85rem' }}>
                Showing 20 of {data.users.length} users
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default BillingReport
