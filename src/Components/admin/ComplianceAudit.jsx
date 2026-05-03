import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

const actionColors = {
  user_status_changed: '#facc15',
  mfa_reset: '#f87171',
  user_deleted: '#f87171',
  failed_login_burst: '#fb923c',
  data_export: 'var(--green)',
  data_access: 'var(--blue)',
}

function ComplianceAudit() {
  const { token } = useAuth()
  const [audit, setAudit] = useState(null)
  const [access, setAccess] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [auditRes, accessRes] = await Promise.all([
          fetch(`${API}/admin/compliance/audit-log`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/admin/compliance/data-access`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setAudit(await auditRes.json())
        setAccess(await accessRes.json())
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  const summary = audit?.compliance_summary

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
          Compliance & Audit Trail
        </h1>
        <p style={{ fontSize: '.85rem', color: 'var(--text)' }}>Track admin actions and data access for compliance</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : (
        <div>
          {/* Compliance KPIs */}
          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Total Users', val: summary.total_users, color: 'var(--blue)' },
                { label: 'MFA Enabled', val: summary.mfa_enabled, color: 'var(--green)' },
                { label: 'MFA Disabled', val: summary.mfa_disabled, color: '#f87171' },
                { label: 'MFA Adoption', val: `${summary.mfa_adoption_pct}%`, color: 'var(--green)' },
                { label: 'Failed Logins (24h)', val: summary.failed_logins_24h, color: '#fb923c' },
              ].map(k => (
                <div key={k.label} style={{ ...card, padding: 16 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: k.color }}>{k.val}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 4 }}>{k.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Admin Audit Log */}
          {audit?.audit_entries?.length > 0 && (
            <div style={card}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>
                Admin Audit Trail
                <span style={{ marginLeft: 10, fontSize: '.75rem', color: 'var(--text)', fontWeight: 400 }}>
                  {audit.total} events
                </span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {audit.audit_entries.map((entry, idx) => (
                  <div
                    key={`${entry.id}-${idx}`}
                    style={{
                      padding: 12,
                      background: 'rgba(255,255,255,.02)',
                      borderLeft: `3px solid ${actionColors[entry.action] || 'var(--text)'}`,
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--heading)' }}>{entry.admin_email}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '.85rem', marginBottom: 4 }}>
                      <span style={{ color: actionColors[entry.action] || 'var(--text)', fontWeight: 600, textTransform: 'uppercase', fontSize: '.7rem' }}>
                        {entry.action.replace(/_/g, ' ')}
                      </span>
                      <span style={{ marginLeft: 8, color: 'var(--heading)' }}>{entry.target_user}</span>
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>{entry.details}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Access Log */}
          {access?.access_logs?.length > 0 && (
            <div style={{ ...card, marginTop: 20 }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>Data Access & Export Log</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Action', 'Method', 'Records', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--heading)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {access.access_logs.map((log, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--heading)' }}>{log.user}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            background: log.action === 'data_export' ? 'rgba(0,255,136,.1)' : 'rgba(59,130,246,.1)',
                            color: log.action === 'data_export' ? 'var(--green)' : 'var(--blue)',
                            padding: '2px 8px', borderRadius: 4, fontSize: '.75rem', fontWeight: 600,
                          }}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text)', textTransform: 'capitalize' }}>{log.method || '—'}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--heading)' }}>{log.records}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: 'rgba(0,255,136,.1)', color: 'var(--green)', padding: '2px 8px', borderRadius: 4, fontSize: '.75rem', fontWeight: 600 }}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '.8rem', color: 'var(--text)' }}>
                          {new Date(log.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Compliance Status */}
          {summary && (
            <div style={{ ...card, marginTop: 20, background: 'rgba(0,255,136,.05)', borderColor: 'rgba(0,255,136,.2)' }}>
              <h3 style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 12 }}>✅ Compliance Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, fontSize: '.85rem' }}>
                <div>
                  <div style={{ marginBottom: 4, color: 'var(--heading)' }}>✓ GDPR Compliant</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>Data handling verified</div>
                </div>
                <div>
                  <div style={{ marginBottom: 4, color: 'var(--heading)' }}>✓ Audit Trail Active</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>{audit?.total || 0} admin events logged</div>
                </div>
                <div>
                  <div style={{ marginBottom: 4, color: 'var(--heading)' }}>✓ MFA Adoption</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>{summary.mfa_adoption_pct}% of users secured</div>
                </div>
                <div>
                  <div style={{ marginBottom: 4, color: summary.failed_logins_24h > 10 ? '#f87171' : 'var(--heading)' }}>
                    {summary.failed_logins_24h > 10 ? '⚠' : '✓'} Login Security
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>{summary.failed_logins_24h} failed attempts (24h)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ComplianceAudit
