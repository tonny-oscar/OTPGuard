import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'
import { generatePDF, pdfKpiGrid, pdfTable, pdfSection, pdfBar, exportCSV } from '../../utils/pdfExport'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }
const sel  = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--heading)', fontSize: '.85rem', outline: 'none', cursor: 'pointer' }
const th   = { padding: '11px 16px', textAlign: 'left', fontWeight: 700, fontSize: '.72rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: .8, borderBottom: '2px solid var(--border)' }
const td   = { padding: '12px 16px', fontSize: '.85rem', borderBottom: '1px solid var(--border)', color: 'var(--heading)' }

function KpiCard({ icon, label, val, color, sub }) {
  return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color, letterSpacing: '-.02em' }}>{val}</div>
        <div style={{ fontSize: '.78rem', color: 'var(--text)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '.72rem', color: 'var(--text)', opacity: .6, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

function planBadge(plan) {
  return <span style={{ background: 'rgba(0,255,136,.1)', color: 'var(--green)', borderRadius: 20, padding: '2px 10px', fontSize: '.72rem', fontWeight: 700, textTransform: 'capitalize', border: '1px solid rgba(0,255,136,.2)' }}>{plan}</span>
}

const CATEGORIES = [
  { value: 'overview',    label: ' Overview' },
  { value: 'inactive',    label: ' Inactive Users' },
  { value: 'at-risk',     label: ' At-Risk Users' },
  { value: 'voluntary',   label: ' Voluntary Churn (60d+)' },
  { value: 'involuntary', label: ' Involuntary Churn (<60d)' },
  { value: 'early',       label: ' Early Churn (joined <30d)' },
  { value: 'retention',   label: ' Retention Analysis' },
  { value: 'by-plan',     label: ' By Plan' },
]

export default function ChurnAnalysis({ initialCategory = 'overview' }) {
  const { token } = useAuth()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState(initialCategory)
  const [days, setDays]         = useState(30)
  const [plan, setPlan]         = useState('')

  // Sync if parent changes the tab
  useEffect(() => { setCategory(initialCategory) }, [initialCategory])

  // Map category to API type param
  const apiType = ['voluntary','involuntary','early'].includes(category) ? category : 'all'

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ type: apiType, days })
    if (plan) params.set('plan', plan)
    fetch(`${API}/admin/churn/analysis?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [token, apiType, days, plan])

  function exportPDF() {
    if (!data) return
    const trend = data.churn_trend || []
    const inactive = data.inactive_users || []
    const atRisk = data.high_risk_users || []
    const retRate = Math.max(0, 100 - (data.churn_rate_30d || 0))

    const html =
      pdfSection('Churn Summary', pdfKpiGrid([
        { val: `${data.churn_rate_30d ?? 0}%`,  label: 'Churn Rate' },
        { val: data.at_risk_users ?? 0,          label: 'At-Risk Users' },
        { val: data.inactive_users_30d ?? 0,     label: 'Inactive Users' },
        { val: data.churned_last_30d ?? 0,       label: 'Churned' },
        { val: `${retRate}%`,                    label: 'Retention Rate' },
      ])) +
      (trend.length ? pdfSection('Churn Trend', pdfTable(
        ['Period', 'Churned'],
        trend.map(m => [m.period ?? '—', m.churned_users ?? 0])
      )) : '') +
      (inactive.length ? pdfSection('Inactive Users', pdfTable(
        ['User', 'Email', 'Plan', 'Last Login', 'Days Inactive'],
        inactive.map(u => [
          u.name || '—', u.email ?? '—', u.plan ?? '—',
          u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never',
          (u.days_inactive ?? 0) + 'd'
        ])
      )) : '') +
      (atRisk.length ? pdfSection('At-Risk Users', pdfTable(
        ['Email', 'Plan', 'Decline', 'Last 30d', 'Prev 30d'],
        atRisk.map(u => [
          u.email ?? '—', u.plan ?? '—',
          (u.activity_decline ?? 0) + '%',
          u.logins_30d ?? 0, u.logins_prev_30d ?? 0
        ])
      )) : '')

    generatePDF(
      'Churn Analysis Report',
      html || '<p style="color:#718096">No data available for this filter.</p>',
      `${CATEGORIES.find(c => c.value === category)?.label ?? category} · Last ${days} days${plan ? ' · ' + plan : ''}`
    )
  }

  const retentionRate = data ? Math.max(0, 100 - data.churn_rate_30d) : 0
  const maxChurned    = data ? Math.max(...(data.churn_trend||[]).map(m=>m.churned_users), 1) : 1
  const planColors    = { starter:'#60a5fa', growth:'var(--green)', business:'#a78bfa', enterprise:'#facc15' }

  // Filter displayed users based on category
  const displayedInactive = data?.inactive_users || []
  const displayedAtRisk   = data?.high_risk_users || []

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <h1 style={{ color:'var(--heading)', fontSize:'1.6rem', fontWeight:800, letterSpacing:'-.02em', marginBottom:4 }}> Churn Analysis</h1>
          <p style={{ fontSize:'.85rem', color:'var(--text)' }}>Monitor churn, identify at-risk users, and track retention</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
        <button onClick={() => data && exportCSV('churn-report',
          ['Email','Name','Plan','Last Login','Days Inactive','Type'],
          (data.inactive_users||[]).map(u => [u.email, u.name||'—', u.plan, u.last_login||'Never', u.days_inactive, u.churn_type])
        )} disabled={!data} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text)', fontWeight:700, cursor: data?'pointer':'not-allowed', fontSize:'.85rem' }}>Export CSV</button>
        <button onClick={exportPDF} disabled={!data} style={{ padding:'8px 18px', borderRadius:8, border:'none', background: data?'var(--green)':'var(--border)', color: data?'#0a0e1a':'var(--text)', fontWeight:700, cursor: data?'pointer':'not-allowed', fontSize:'.85rem' }}>
           Export PDF
        </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20, padding:'14px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <label style={{ fontSize:'.72rem', fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:.8 }}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...sel, minWidth:220 }}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <label style={{ fontSize:'.72rem', fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:.8 }}>Period</label>
          <select value={days} onChange={e => setDays(Number(e.target.value))} style={sel}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <label style={{ fontSize:'.72rem', fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:.8 }}>Plan</label>
          <select value={plan} onChange={e => setPlan(e.target.value)} style={sel}>
            <option value="">All Plans</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:80, gap:16 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid rgba(0,255,136,.15)', borderTopColor:'var(--green)', animation:'spin .8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : !data ? null : (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/*  OVERVIEW  */}
          {category === 'overview' && <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
              <KpiCard icon="" label="Churn Rate"     val={`${data.churn_rate_30d}%`}  color="#f87171" />
              <KpiCard icon="" label="At-Risk Users"  val={data.at_risk_users}          color="#facc15" sub="Declining activity" />
              <KpiCard icon="" label="Inactive Users" val={data.inactive_users_30d}     color="#fb923c" sub="No login in period" />
              <KpiCard icon="" label="Churned"        val={data.churned_last_30d}       color="#f87171" />
            </div>
            <div style={{ ...card, background:'var(--green-dim)', border:'1px solid rgba(0,255,136,.2)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <h3 style={{ color:'var(--heading)', fontWeight:700 }}>Retention Health</h3>
                <span style={{ fontWeight:800, fontSize:'1.4rem', color: retentionRate>=80?'var(--green)':retentionRate>=60?'#facc15':'#f87171' }}>{retentionRate}%</span>
              </div>
              <div style={{ background:'var(--border)', borderRadius:8, height:12, overflow:'hidden', marginBottom:8 }}>
                <div style={{ width:`${retentionRate}%`, height:'100%', borderRadius:8, background: retentionRate>=80?'linear-gradient(90deg,var(--green),#00cc6a)':retentionRate>=60?'linear-gradient(90deg,#facc15,#fb923c)':'linear-gradient(90deg,#f87171,#ef4444)', transition:'width .6s ease' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.75rem', color:'var(--text)' }}>
                <span> Poor (&lt;60%)</span><span> Fair (60–80%)</span><span> Good (&gt;80%)</span>
              </div>
            </div>
            <div style={card}>
              <h3 style={{ color:'var(--heading)', fontWeight:700, marginBottom:20 }}>Churn Trend</h3>
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:120 }}>
                {data.churn_trend.map((m,i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:'.72rem', color:'var(--text)', fontWeight:600 }}>{m.churned_users}</span>
                    <div style={{ width:'100%', borderRadius:'4px 4px 0 0', height:`${Math.max((m.churned_users/maxChurned)*90, m.churned_users?6:0)}px`, background: i===data.churn_trend.length-1?'#f87171':'rgba(248,113,113,.45)' }} />
                    <span style={{ fontSize:'.72rem', color:'var(--text)' }}>{m.period.split('-')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...card, background:'rgba(250,204,21,.06)', border:'1px solid rgba(250,204,21,.2)' }}>
              <h3 style={{ color:'#facc15', fontWeight:700, marginBottom:12 }}> Recommendations</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:10 }}>
                {[{icon:'',text:'Re-engagement emails to inactive users'},{icon:'',text:'Promotions for at-risk customers'},{icon:'',text:'Check-ins with high-value accounts'},{icon:'',text:'Review pricing for declining users'}].map((r,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', background:'var(--bg)', borderRadius:8 }}>
                    <span>{r.icon}</span><span style={{ fontSize:'.83rem', color:'var(--text)', lineHeight:1.5 }}>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/*  INACTIVE / VOLUNTARY / INVOLUNTARY / EARLY  */}
          {['inactive','voluntary','involuntary','early'].includes(category) && (
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--green-dim)' }}>
                <h3 style={{ color:'var(--heading)', fontWeight:700 }}>{CATEGORIES.find(c=>c.value===category)?.label}</h3>
                <span style={{ fontSize:'.8rem', color:'var(--text)' }}>{displayedInactive.length} users</span>
              </div>
              {displayedInactive.length === 0 ? (
                <div style={{ padding:48, textAlign:'center', color:'var(--text)', opacity:.5 }}> No users in this category</div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead style={{ background:'var(--green-dim)' }}>
                      <tr><th style={th}>User</th><th style={th}>Plan</th><th style={th}>Last Login</th><th style={th}>Days Inactive</th><th style={th}>Type</th><th style={th}>Joined</th></tr>
                    </thead>
                    <tbody>
                      {displayedInactive.map((u,i) => (
                        <tr key={i}>
                          <td style={td}><div style={{ fontWeight:600 }}>{u.name||'—'}</div><div style={{ fontSize:'.72rem', color:'var(--text)', marginTop:2 }}>{u.email}</div></td>
                          <td style={td}>{planBadge(u.plan)}</td>
                          <td style={{ ...td, color:'var(--text)' }}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : <span style={{ color:'#f87171' }}>Never</span>}</td>
                          <td style={td}><span style={{ fontWeight:700, color: u.days_inactive>60?'#f87171':u.days_inactive>30?'#facc15':'var(--text)' }}>{u.days_inactive}d</span></td>
                          <td style={td}><span style={{ background: u.churn_type==='early'?'rgba(99,102,241,.15)':u.churn_type==='voluntary'?'rgba(248,113,113,.15)':'rgba(250,204,21,.15)', color: u.churn_type==='early'?'#818cf8':u.churn_type==='voluntary'?'#f87171':'#facc15', padding:'2px 8px', borderRadius:20, fontSize:'.72rem', fontWeight:700, textTransform:'capitalize' }}>{u.churn_type||'—'}</span></td>
                          <td style={{ ...td, color:'var(--text)' }}>{new Date(u.joined).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/*  AT-RISK  */}
          {category === 'at-risk' && (
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(250,204,21,.05)' }}>
                <h3 style={{ color:'var(--heading)', fontWeight:700 }}> At-Risk Users — Declining Activity</h3>
                <span style={{ fontSize:'.8rem', color:'var(--text)' }}>{displayedAtRisk.length} users</span>
              </div>
              {displayedAtRisk.length === 0 ? (
                <div style={{ padding:48, textAlign:'center', color:'var(--text)', opacity:.5 }}> No at-risk users</div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead style={{ background:'rgba(250,204,21,.05)' }}>
                      <tr><th style={th}>User</th><th style={th}>Plan</th><th style={th}>Activity Decline</th><th style={th}>Last 30d</th><th style={th}>Prev 30d</th><th style={th}>Risk</th></tr>
                    </thead>
                    <tbody>
                      {displayedAtRisk.map((u,i) => {
                        const risk = u.activity_decline>75?'critical':u.activity_decline>50?'high':'medium'
                        const rc   = {critical:'#f87171',high:'#fb923c',medium:'#facc15'}[risk]
                        return (
                          <tr key={i}>
                            <td style={td}><div style={{ fontWeight:600 }}>{u.email}</div></td>
                            <td style={td}>{planBadge(u.plan)}</td>
                            <td style={td}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ flex:1, background:'var(--border)', borderRadius:4, height:6, maxWidth:80 }}>
                                  <div style={{ width:`${u.activity_decline}%`, height:'100%', background:rc, borderRadius:4 }} />
                                </div>
                                <span style={{ fontWeight:700, color:rc, fontSize:'.82rem' }}>{u.activity_decline}%</span>
                              </div>
                            </td>
                            <td style={td}>{u.logins_30d}</td>
                            <td style={{ ...td, color:'var(--text)' }}>{u.logins_prev_30d}</td>
                            <td style={td}><span style={{ background:`${rc}20`, color:rc, padding:'2px 8px', borderRadius:20, fontSize:'.72rem', fontWeight:700, textTransform:'capitalize' }}>{risk}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/*  RETENTION  */}
          {category === 'retention' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
                <KpiCard icon="" label="Retention Rate" val={`${retentionRate}%`}       color="var(--green)" sub="Inverse of churn" />
                <KpiCard icon="" label="Churned"        val={data.churned_last_30d}     color="#f87171" sub="Last period" />
                <KpiCard icon="" label="At-Risk"        val={data.at_risk_users}        color="#facc15" />
                <KpiCard icon="" label="Inactive"       val={data.inactive_users_30d}   color="#fb923c" />
              </div>
              <div style={card}>
                <h3 style={{ color:'var(--heading)', fontWeight:700, marginBottom:20 }}>Monthly Churn vs Retention</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {data.churn_trend.map((m,i) => {
                    const churnPct = Math.min(m.churned_users*5, 100)
                    const retPct   = 100 - churnPct
                    return (
                      <div key={i}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.8rem', marginBottom:6 }}>
                          <span style={{ fontWeight:600, color:'var(--heading)' }}>{m.period}</span>
                          <span style={{ color:'var(--text)' }}>{m.churned_users} churned</span>
                        </div>
                        <div style={{ display:'flex', height:10, borderRadius:6, overflow:'hidden' }}>
                          <div style={{ width:`${retPct}%`, background:'var(--green)', transition:'width .5s' }} />
                          <div style={{ width:`${churnPct}%`, background:'#f87171', transition:'width .5s' }} />
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', marginTop:4 }}>
                          <span style={{ color:'var(--green)' }}>Retained {retPct}%</span>
                          <span style={{ color:'#f87171' }}>Churned {churnPct}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/*  BY PLAN  */}
          {category === 'by-plan' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={card}>
                <h3 style={{ color:'var(--heading)', fontWeight:700, marginBottom:20 }}>Inactive Users by Plan</h3>
                {Object.keys(data.plan_breakdown||{}).length === 0 ? (
                  <div style={{ textAlign:'center', padding:32, color:'var(--text)', opacity:.5 }}>No data</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {Object.entries(data.plan_breakdown).sort((a,b)=>b[1]-a[1]).map(([p,count]) => {
                      const total = Object.values(data.plan_breakdown).reduce((a,b)=>a+b,0)||1
                      const pct   = Math.round(count/total*100)
                      const color = planColors[p]||'var(--text)'
                      return (
                        <div key={p}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'.88rem' }}>
                            <span style={{ fontWeight:600, textTransform:'capitalize', color:'var(--heading)' }}>{p}</span>
                            <span style={{ color, fontWeight:700 }}>{count} users ({pct}%)</span>
                          </div>
                          <div style={{ background:'var(--border)', borderRadius:6, height:10, overflow:'hidden' }}>
                            <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:6, transition:'width .5s' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div style={card}>
                <h3 style={{ color:'var(--heading)', fontWeight:700, marginBottom:20 }}>At-Risk Users by Plan</h3>
                {Object.keys(data.plan_breakdown||{}).length === 0 ? (
                  <div style={{ textAlign:'center', padding:32, color:'var(--text)', opacity:.5 }}>No data</div>
                ) : (() => {
                  const rb = (data.high_risk_users||[]).reduce((acc,u)=>{ acc[u.plan]=(acc[u.plan]||0)+1; return acc },{})
                  const rt = Object.values(rb).reduce((a,b)=>a+b,0)||1
                  return Object.keys(rb).length === 0 ? (
                    <div style={{ textAlign:'center', padding:32, color:'var(--text)', opacity:.5 }}> No at-risk users</div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {Object.entries(rb).sort((a,b)=>b[1]-a[1]).map(([p,count]) => {
                        const pct = Math.round(count/rt*100)
                        return (
                          <div key={p}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'.88rem' }}>
                              <span style={{ fontWeight:600, textTransform:'capitalize', color:'var(--heading)' }}>{p}</span>
                              <span style={{ color:'#facc15', fontWeight:700 }}>{count} at-risk ({pct}%)</span>
                            </div>
                            <div style={{ background:'var(--border)', borderRadius:6, height:10, overflow:'hidden' }}>
                              <div style={{ width:`${pct}%`, height:'100%', background:'#facc15', borderRadius:6, transition:'width .5s' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}


