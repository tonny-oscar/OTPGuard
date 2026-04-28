import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'
import { generatePDF, pdfKpiGrid, pdfTable, pdfSection } from '../../utils/pdfExport'

const card = { background: 'var(--surface)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: 24 }
const sel  = { background: 'var(--bg)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 12px', color: 'var(--heading)', fontSize: '.85rem', outline: 'none', cursor: 'pointer' }
const th   = { padding: '11px 16px', textAlign: 'left', fontWeight: 700, fontSize: '.72rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: .8, borderBottom: '2px solid rgba(0,255,136,.12)' }
const td   = { padding: '12px 16px', fontSize: '.85rem', borderBottom: '1px solid rgba(255,255,255,.04)', color: 'var(--heading)' }

const REPORT_TYPES = [
  { value: 'usage',     label: '📊 Usage Report',     desc: 'OTP operations by method and status' },
  { value: 'security',  label: '🔒 Security Report',  desc: 'Failed logins and suspicious IPs' },
  { value: 'churn',     label: '📉 Churn Report',     desc: 'Inactive users by plan and period' },
  { value: 'lifecycle', label: '🔄 Lifecycle Report', desc: 'Cohort retention analysis' },
]

export default function CustomReports({ initialType = 'usage' }) {
  const { token } = useAuth()
  const [reportType, setReportType]         = useState(initialType)
  const [result, setResult]                 = useState(null)
  const [generating, setGenerating]         = useState(false)
  const [filters, setFilters]               = useState({})

  // Sync if parent changes the tab
  useEffect(() => { setReportType(initialType); setResult(null); setFilters({}) }, [initialType])

  function setF(k, v) { setFilters(f => ({ ...f, [k]: v || undefined })) }

  async function generate() {
    setGenerating(true)
    try {
      const res  = await fetch(`${API}/admin/reports/custom`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportType, filters }),
      })
      setResult(await res.json())
    } catch (e) { console.error(e) }
    finally { setGenerating(false) }
  }

  function exportPDF() {
    if (!result) return
    const label = REPORT_TYPES.find(r => r.value === reportType)?.label || 'Report'
    let html = ''
    if (result.type === 'usage') {
      html = pdfSection('Summary', pdfKpiGrid([
        { val: result.total_operations, label: 'Total Operations' },
        ...Object.entries(result.by_method||{}).map(([m,c]) => ({ val: c, label: m+' OTPs' })),
      ])) + pdfSection('By Status', pdfTable(['Status','Count'], Object.entries(result.by_status||{}).map(([s,c])=>[s,c])))
    } else if (result.type === 'security') {
      html = pdfSection('Security', pdfKpiGrid([
        { val: result.failed_attempts, label: 'Failed Attempts' },
        { val: result.suspicious_ips,  label: 'Suspicious IPs' },
      ])) + (result.top_ips?.length ? pdfSection('Top IPs', pdfTable(['IP','Attempts'], result.top_ips.map(ip=>[ip.ip,ip.attempts]))) : '')
    } else if (result.type === 'churn') {
      html = pdfSection('Churn', pdfKpiGrid([{ val: result.inactive_count, label: 'Inactive Users' }])) +
        (result.inactive_users?.length ? pdfSection('Users', pdfTable(['Email','Plan','Days Inactive'], result.inactive_users.map(u=>[u.email,u.plan,u.days_inactive+'d']))) : '')
    } else if (result.type === 'lifecycle') {
      html = pdfSection('Cohorts', pdfTable(['Month','Signups','Active','Retention'], (result.cohorts||[]).map(c=>[c.month,c.signups,c.active,c.retention+'%'])))
    }
    generatePDF(label, html, `Generated ${new Date(result.generated).toLocaleString()}`)
  }

  const info = REPORT_TYPES.find(r => r.value === reportType)

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:24 }}>
        <div>
          <h1 style={{ color:'var(--heading)', fontSize:'1.6rem', fontWeight:800, letterSpacing:'-.02em', marginBottom:4 }}>📋 Custom Reports</h1>
          <p style={{ fontSize:'.85rem', color:'var(--text)' }}>Generate, filter, and export reports as PDF</p>
        </div>
        {result && (
          <button onClick={exportPDF} style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'var(--green)', color:'#0a0e1a', fontWeight:700, cursor:'pointer', fontSize:'.85rem' }}>
            📄 Export PDF
          </button>
        )}
      </div>

      {/* Config card */}
      <div style={{ ...card, marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:20 }}>

          {/* Report type dropdown */}
          <div>
            <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ ...sel, width:'100%' }}>
              {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <div style={{ fontSize:'.72rem', color:'var(--text)', marginTop:4, opacity:.7 }}>{info?.desc}</div>
          </div>

          {/* Days — usage, security, churn */}
          {['usage','security','churn'].includes(reportType) && (
            <div>
              <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>Period</label>
              <select value={filters.days || (reportType==='security'?7:30)} onChange={e => setF('days', parseInt(e.target.value))} style={{ ...sel, width:'100%' }}>
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          )}

          {/* Method — usage */}
          {reportType === 'usage' && (
            <div>
              <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>OTP Method</label>
              <select value={filters.method||''} onChange={e => setF('method', e.target.value)} style={{ ...sel, width:'100%' }}>
                <option value="">All Methods</option>
                <option value="email">Email OTP</option>
                <option value="sms">SMS OTP</option>
                <option value="totp">Authenticator</option>
              </select>
            </div>
          )}

          {/* Status — usage */}
          {reportType === 'usage' && (
            <div>
              <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>Status</label>
              <select value={filters.status||''} onChange={e => setF('status', e.target.value)} style={{ ...sel, width:'100%' }}>
                <option value="">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          )}

          {/* Plan — churn */}
          {reportType === 'churn' && (
            <div>
              <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>Plan</label>
              <select value={filters.plan||''} onChange={e => setF('plan', e.target.value)} style={{ ...sel, width:'100%' }}>
                <option value="">All Plans</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          )}
        </div>

        <button onClick={generate} disabled={generating} style={{ padding:'10px 28px', borderRadius:8, border:'none', background:'var(--green)', color:'#0a0e1a', fontWeight:700, cursor: generating?'not-allowed':'pointer', fontSize:'.9rem', opacity: generating?.7:1 }}>
          {generating ? 'Generating…' : '⚡ Generate Report'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h3 style={{ color:'var(--heading)', fontWeight:700 }}>{info?.label} — Results</h3>
            <span style={{ fontSize:'.72rem', color:'var(--text)' }}>{new Date(result.generated).toLocaleString()}</span>
          </div>

          {/* Usage */}
          {result.type === 'usage' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
                <div style={{ background:'var(--bg)', borderRadius:10, padding:16 }}>
                  <div style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--heading)' }}>{result.total_operations}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--text)', marginTop:4 }}>Total Operations</div>
                </div>
                {Object.entries(result.by_method||{}).map(([m,c]) => (
                  <div key={m} style={{ background:'var(--bg)', borderRadius:10, padding:16 }}>
                    <div style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--green)' }}>{c}</div>
                    <div style={{ fontSize:'.75rem', color:'var(--text)', marginTop:4, textTransform:'capitalize' }}>{m} OTPs</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead style={{ background:'rgba(0,255,136,.03)' }}><tr><th style={th}>Status</th><th style={th}>Count</th></tr></thead>
                  <tbody>{Object.entries(result.by_status||{}).map(([s,c]) => <tr key={s}><td style={{ ...td, textTransform:'capitalize' }}>{s}</td><td style={{ ...td, fontWeight:700 }}>{c}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* Security */}
          {result.type === 'security' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
                <div style={{ background:'var(--bg)', borderRadius:10, padding:16 }}>
                  <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#f87171' }}>{result.failed_attempts}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--text)', marginTop:4 }}>Failed Attempts</div>
                </div>
                <div style={{ background:'var(--bg)', borderRadius:10, padding:16 }}>
                  <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#facc15' }}>{result.suspicious_ips}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--text)', marginTop:4 }}>Suspicious IPs</div>
                </div>
              </div>
              {result.top_ips?.length > 0 && (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead style={{ background:'rgba(248,113,113,.05)' }}><tr><th style={th}>IP Address</th><th style={th}>Attempts</th></tr></thead>
                    <tbody>{result.top_ips.map((ip,i) => <tr key={i}><td style={{ ...td, fontFamily:'monospace' }}>{ip.ip}</td><td style={{ ...td, color:'#f87171', fontWeight:700 }}>{ip.attempts}</td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Churn */}
          {result.type === 'churn' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
                <div style={{ background:'var(--bg)', borderRadius:10, padding:16 }}>
                  <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#f87171' }}>{result.inactive_count}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--text)', marginTop:4 }}>Inactive Users</div>
                </div>
              </div>
              {result.inactive_users?.length > 0 && (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead style={{ background:'rgba(0,255,136,.03)' }}><tr><th style={th}>Email</th><th style={th}>Plan</th><th style={th}>Days Inactive</th></tr></thead>
                    <tbody>{result.inactive_users.map((u,i) => (
                      <tr key={i}>
                        <td style={td}>{u.email}</td>
                        <td style={td}><span style={{ background:'rgba(0,255,136,.1)', color:'var(--green)', padding:'2px 8px', borderRadius:20, fontSize:'.72rem', fontWeight:700, textTransform:'capitalize', border:'1px solid rgba(0,255,136,.2)' }}>{u.plan}</span></td>
                        <td style={{ ...td, fontWeight:700, color: u.days_inactive>60?'#f87171':'#facc15' }}>{u.days_inactive}d</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Lifecycle */}
          {result.type === 'lifecycle' && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead style={{ background:'rgba(0,255,136,.03)' }}><tr><th style={th}>Month</th><th style={th}>Signups</th><th style={th}>Active</th><th style={th}>Retention</th></tr></thead>
                <tbody>{(result.cohorts||[]).map((c,i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight:600 }}>{c.month}</td>
                    <td style={td}>{c.signups}</td>
                    <td style={{ ...td, color:'var(--green)', fontWeight:700 }}>{c.active}</td>
                    <td style={td}><span style={{ background: c.retention>=80?'rgba(0,255,136,.15)':c.retention>=50?'rgba(250,204,21,.15)':'rgba(248,113,113,.15)', color: c.retention>=80?'var(--green)':c.retention>=50?'#facc15':'#f87171', padding:'2px 8px', borderRadius:20, fontWeight:700, fontSize:'.78rem' }}>{c.retention}%</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
