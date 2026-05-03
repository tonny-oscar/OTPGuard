import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'
import { generatePDF, pdfKpiGrid, pdfTable, pdfSection, pdfBar } from '../../utils/pdfExport'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }

const planColors = {
  starter:    '#60a5fa',
  growth:     'var(--green)',
  business:   '#a78bfa',
  enterprise: '#facc15',
}

function fmt(val, currency) {
  if (currency === 'kes') return `KES ${Number(val).toLocaleString()}`
  return `$${Number(val).toLocaleString()}`
}

function StatCard({ label, val, sub, color, pct }) {
  return (
    <div style={card}>
      <div style={{ fontSize: '.72rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: color || 'var(--heading)', marginBottom: 4 }}>{val}</div>
      {sub && <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>{sub}</div>}
      {pct !== undefined && (
        <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden', marginTop: 10 }}>
          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'var(--green)', borderRadius: 4, transition: 'width .6s ease' }} />
        </div>
      )}
    </div>
  )
}

function RevenueAnalytics() {
  const { token } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('kes')  // 'kes' | 'usd'

  useEffect(() => {
    fetch(`${API}/admin/revenue/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [token])

  function exportPDF() {
    if (!data) return
    const c = currency
    const html =
      pdfSection('Revenue Summary', pdfKpiGrid([
        { val: fmt(c === 'kes' ? data.total_monthly_revenue_kes : data.total_monthly_revenue_usd, c), label: 'Monthly Revenue' },
        { val: fmt(c === 'kes' ? data.monthly_target_kes : data.monthly_target_usd, c),             label: 'Monthly Target' },
        { val: data.total_subscriptions,  label: 'Total Users' },
        { val: data.paying_subscriptions, label: 'Paying Users' },
        { val: fmt(c === 'kes' ? data.avg_revenue_per_user_kes : data.avg_revenue_per_user_usd, c), label: 'ARPU' },
        { val: fmt(data.sms_cost_kes, 'kes'), label: 'SMS Cost (30d)' },
      ])) +
      pdfSection('Plan Distribution',
        data.plan_breakdown.map(p =>
          pdfBar(
            `${p.plan} — ${p.users} users × ${fmt(c === 'kes' ? p.price_kes : p.price_usd, c)}/mo`,
            p.percentage
          )
        ).join('') +
        pdfTable(
          ['Plan', 'Users', `Price/mo (${c.toUpperCase()})`, `Revenue (${c.toUpperCase()})`, 'Share'],
          data.plan_breakdown.map(p => [
            p.plan,
            p.users,
            fmt(c === 'kes' ? p.price_kes : p.price_usd, c),
            fmt(c === 'kes' ? p.revenue_kes : p.revenue_usd, c),
            `${p.percentage}%`,
          ])
        )
      ) +
      pdfSection('7-Day Revenue Trend', pdfTable(
        ['Day', 'SMS Count', `Revenue (${c.toUpperCase()})`],
        data.revenue_trend_7d.map(d => [d.day, d.sms_count, fmt(c === 'kes' ? d.revenue_kes : d.revenue_usd, c)])
      ))
    generatePDF('Revenue Analytics Report', html,
      `Currency: ${currency.toUpperCase()} | Monthly target: ${fmt(c === 'kes' ? data.monthly_target_kes : data.monthly_target_usd, c)}`
    )
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading...</div>
  if (!data)   return null

  const rev     = currency === 'kes' ? data.total_monthly_revenue_kes : data.total_monthly_revenue_usd
  const target  = currency === 'kes' ? data.monthly_target_kes        : data.monthly_target_usd
  const arpu    = currency === 'kes' ? data.avg_revenue_per_user_kes   : data.avg_revenue_per_user_usd
  const targetPct = Math.round(rev / (target || 1) * 100)
  const maxTrend  = Math.max(...data.revenue_trend_7d.map(d => currency === 'kes' ? d.revenue_kes : d.revenue_usd), 1)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4 }}>Revenue Dashboard</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text)' }}>Real subscription revenue from active users</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Currency toggle */}
          <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            {['kes', 'usd'].map(c => (
              <button key={c} onClick={() => setCurrency(c)} style={{
                padding: '7px 16px', border: 'none', cursor: 'pointer', fontWeight: 700,
                fontSize: '.82rem', textTransform: 'uppercase', transition: 'all .15s',
                background: currency === c ? 'var(--green)' : 'transparent',
                color:      currency === c ? '#0a0e1a'      : 'var(--text)',
              }}>{c}</button>
            ))}
          </div>
          <button onClick={exportPDF} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: 'var(--green)', color: '#0a0e1a',
            fontWeight: 700, cursor: 'pointer', fontSize: '.85rem',
          }}>Export PDF</button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Monthly Revenue"
          val={fmt(rev, currency)}
          sub={`Target: ${fmt(target, currency)}`}
          color="var(--green)"
          pct={targetPct}
        />
        <StatCard
          label="Paying Users"
          val={data.paying_subscriptions}
          sub={`${data.starter_subscriptions} on free plan`}
          color="var(--blue)"
        />
        <StatCard
          label="Total Users"
          val={data.total_subscriptions}
          color="var(--heading)"
        />
        <StatCard
          label="ARPU"
          val={fmt(arpu, currency)}
          sub="Avg revenue per user"
          color="#a78bfa"
        />
        <StatCard
          label="SMS Cost (30d)"
          val={`KES ${data.sms_cost_kes.toLocaleString()}`}
          sub={`${data.sms_count_30d} SMS sent`}
          color="#facc15"
        />
      </div>

      {/* Target progress */}
      <div style={{ ...card, marginBottom: 24, background: 'linear-gradient(135deg,rgba(0,255,136,.05),rgba(0,255,136,.02))', border: '1px solid rgba(0,255,136,.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 2 }}>Monthly Revenue Target</h3>
            <p style={{ fontSize: '.78rem', color: 'var(--text)' }}>
              {fmt(rev, currency)} of {fmt(target, currency)} target
            </p>
          </div>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: targetPct >= 100 ? 'var(--green)' : targetPct >= 50 ? '#facc15' : '#f87171' }}>
            {targetPct}%
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(targetPct, 100)}%`, height: '100%', background: 'linear-gradient(90deg,var(--green),#00cc6a)', borderRadius: 8, transition: 'width .8s ease' }} />
        </div>
      </div>

      {/* Plan breakdown */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 20 }}>Revenue by Plan</h3>
        {data.plan_breakdown.length === 0 ? (
          <p style={{ color: 'var(--text)', opacity: .6, fontSize: '.88rem' }}>No paying users yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {data.plan_breakdown.map(p => {
              const planRev = currency === 'kes' ? p.revenue_kes : p.revenue_usd
              const planPrice = currency === 'kes' ? p.price_kes : p.price_usd
              const color = planColors[p.plan] || 'var(--green)'
              return (
                <div key={p.plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: 'var(--heading)', textTransform: 'capitalize' }}>{p.plan}</span>
                      <span style={{ fontSize: '.75rem', color: 'var(--text)' }}>
                        {p.users} user{p.users !== 1 ? 's' : ''} × {fmt(planPrice, currency)}/mo
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color }}>{fmt(planRev, currency)}</span>
                      <span style={{ fontSize: '.72rem', color: 'var(--text)', marginLeft: 8 }}>{p.percentage}%</span>
                    </div>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${p.percentage}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .5s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 7-day trend chart */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 20 }}>
          7-Day Revenue Trend
          <span style={{ fontSize: '.75rem', color: 'var(--text)', fontWeight: 400, marginLeft: 8 }}>
            (based on SMS OTP activity)
          </span>
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
          {data.revenue_trend_7d.map((day, i) => {
            const val = currency === 'kes' ? day.revenue_kes : day.revenue_usd
            const pct = (val / maxTrend) * 100
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '.7rem', color: 'var(--text)', fontWeight: 600 }}>
                  {val > 0 ? fmt(val, currency) : '—'}
                </span>
                <div style={{ width: '100%', height: `${Math.max(pct, val > 0 ? 4 : 0)}%`, background: 'linear-gradient(180deg,var(--green),#00cc6a)', borderRadius: '3px 3px 0 0', minHeight: val > 0 ? 4 : 0, transition: 'height .4s ease' }} />
                <span style={{ fontSize: '.7rem', color: 'var(--text)' }}>{day.day}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '.75rem', color: 'var(--text)' }}>
          <span>Total SMS (30d): {data.sms_count_30d}</span>
          <span>SMS cost: KES {data.sms_cost_kes.toLocaleString()}</span>
        </div>
      </div>

      {/* Subscription health */}
      <div style={card}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 20 }}>Subscription Health</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 20 }}>
          {[
            { label: 'Free (Starter)', val: data.starter_subscriptions, color: '#60a5fa',
              pct: Math.round(data.starter_subscriptions / (data.total_subscriptions || 1) * 100) },
            { label: 'Paying',         val: data.paying_subscriptions,  color: 'var(--green)',
              pct: Math.round(data.paying_subscriptions / (data.total_subscriptions || 1) * 100) },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '.78rem', color: 'var(--text)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text)', marginTop: 4 }}>{s.pct}% of total</div>
              <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RevenueAnalytics
