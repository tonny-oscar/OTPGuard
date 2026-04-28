import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'
import { generatePDF, pdfKpiGrid, pdfTable, pdfSection, pdfBar } from '../../utils/pdfExport'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }

function LifecycleAnalytics() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/admin/lifecycle/analytics`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [token])

  function exportPDF() {
    if (!data) return
    const s = data.lifecycle_stages
    const html =
      pdfSection('Lifecycle Stages', pdfKpiGrid([
        { val: s.new_users_7d,        label: 'New Users (7d)' },
        { val: s.active_users_30d,    label: 'Active Users (30d)' },
        { val: s.mature_users_30_90d, label: 'Mature Users (30-90d)' },
        { val: s.loyal_users_1y,      label: 'Loyal Users (1y+)' },
      ])) +
      pdfSection('Key Metrics', pdfKpiGrid([
        { val: `${data.avg_user_lifetime} days`, label: 'Avg User Lifetime' },
        { val: `${data.onboarding_completion_rate}%`, label: 'Onboarding Completion' },
        { val: `${data.feature_adoption_rate}%`, label: 'Feature Adoption' },
      ])) +
      pdfSection('Cohort Retention Analysis', pdfTable(
        ['Month', 'Signups', 'Active', 'Retention %'],
        data.cohort_analysis.map(c => [
          c.month, c.signups, c.active,
          `<span class="badge ${c.retention >= 80 ? 'badge-green' : c.retention >= 50 ? 'badge-yellow' : 'badge-red'}">${c.retention}%</span>`,
        ])
      )) +
      `<div class="tip">Onboarding: ${data.onboarding_completion_rate}% complete setup · Feature adoption: ${data.feature_adoption_rate}% · Avg lifetime: ${data.avg_user_lifetime} days</div>`
    generatePDF('User Lifecycle Analytics Report', html)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
            🔄 User Lifecycle Analytics
          </h1>
          <p style={{ fontSize: '.85rem' }}>Track user journey and lifecycle stages</p>
        </div>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : data ? (
        <div>
          {/* Lifecycle Stages */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>User Lifecycle Stages</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
              {[
                {
                  icon: '🆕',
                  label: 'New Users (7d)',
                  val: data.lifecycle_stages.new_users_7d,
                  color: 'var(--blue)',
                },
                {
                  icon: '🚀',
                  label: 'Active Users (30d)',
                  val: data.lifecycle_stages.active_users_30d,
                  color: 'var(--green)',
                },
                {
                  icon: '📈',
                  label: 'Mature Users (30-90d)',
                  val: data.lifecycle_stages.mature_users_30_90d,
                  color: '#facc15',
                },
                {
                  icon: '⭐',
                  label: 'Loyal Users (1y+)',
                  val: data.lifecycle_stages.loyal_users_1y,
                  color: 'var(--green)',
                },
              ].map((stage, i) => (
                <div key={i} style={card}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stage.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stage.color }}>
                    {stage.val}
                  </div>
                  <div style={{ fontSize: '.8rem', marginTop: 4 }}>{stage.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
              gap: 20,
              marginBottom: 28,
            }}
          >
            {[
              {
                icon: '⏱️',
                label: 'Avg User Lifetime',
                val: `${data.avg_user_lifetime} days`,
                sub: '~6 months',
              },
              {
                icon: '🎓',
                label: 'Onboarding Completion',
                val: `${data.onboarding_completion_rate}%`,
                sub: 'Users who complete setup',
              },
              {
                icon: '🎯',
                label: 'Feature Adoption',
                val: `${data.feature_adoption_rate}%`,
                sub: 'Using advanced features',
              },
            ].map((metric, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: '1.4rem', marginBottom: 12 }}>{metric.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 4 }}>
                  {metric.val}
                </div>
                <div style={{ fontSize: '.8rem', marginTop: 4 }}>{metric.label}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 6 }}>{metric.sub}</div>
              </div>
            ))}
          </div>

          {/* Cohort Analysis */}
          <div style={card}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>Cohort Retention Analysis</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', minWidth: 500 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Signup Month</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Signups</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Active</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Retention %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cohort_analysis.map((cohort, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{cohort.month}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{cohort.signups}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--green)', fontWeight: 600 }}>
                        {cohort.active}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            padding: '2px 8px',
                            background:
                              cohort.retention >= 80
                                ? 'rgba(0,255,136,.1)'
                                : cohort.retention >= 50
                                  ? 'rgba(250,204,21,.1)'
                                  : 'rgba(248,113,113,.1)',
                            color:
                              cohort.retention >= 80
                                ? 'var(--green)'
                                : cohort.retention >= 50
                                  ? '#facc15'
                                  : '#f87171',
                            fontWeight: 600,
                          }}
                        >
                          {cohort.retention}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lifecycle Visualization */}
          <div style={{ ...card, marginTop: 20 }}>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}>User Journey Funnel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  stage: 'New Users (First 7 days)',
                  count: data.lifecycle_stages.new_users_7d,
                  pct: 100,
                  color: 'var(--blue)',
                },
                {
                  stage: 'Active Users (First 30 days)',
                  count: data.lifecycle_stages.active_users_30d,
                  pct: 65,
                  color: 'var(--green)',
                },
                {
                  stage: 'Mature Users (30-90 days)',
                  count: data.lifecycle_stages.mature_users_30_90d,
                  pct: 40,
                  color: '#facc15',
                },
                {
                  stage: 'Loyal Users (1 year+)',
                  count: data.lifecycle_stages.loyal_users_1y,
                  pct: 20,
                  color: '#00cc6a',
                },
              ].map((level, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{level.stage}</span>
                    <span style={{ color: level.color, fontWeight: 700 }}>{level.count}</span>
                  </div>
                  <div
                    style={{
                      width: `${level.pct}%`,
                      height: 24,
                      background: level.color,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 12,
                      fontSize: '.75rem',
                      fontWeight: 700,
                      color: '#fff',
                      opacity: 0.8,
                    }}
                  >
                    {level.pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div style={{ ...card, marginTop: 20, background: 'rgba(0,255,136,.05)', borderColor: 'rgba(0,255,136,.2)' }}>
            <h3 style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 12 }}>📊 Lifecycle Insights</h3>
            <ul style={{ fontSize: '.85rem', color: 'var(--text)', paddingLeft: 20, lineHeight: 1.8 }}>
              <li>
                <strong>Onboarding Health:</strong> {data.onboarding_completion_rate}% of users complete initial setup
              </li>
              <li>
                <strong>Feature Adoption:</strong> {data.feature_adoption_rate}% of active users are using advanced features
              </li>
              <li>
                <strong>User Lifetime:</strong> Average user stays for {data.avg_user_lifetime} days (~
                {Math.round(data.avg_user_lifetime / 30)} months)
              </li>
              <li>
                <strong>Cohort Trend:</strong> Newer cohorts show{' '}
                {data.cohort_analysis[0]?.retention > data.cohort_analysis[data.cohort_analysis.length - 1]?.retention
                  ? 'lower'
                  : 'higher'}{' '}
                retention rates
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default LifecycleAnalytics
