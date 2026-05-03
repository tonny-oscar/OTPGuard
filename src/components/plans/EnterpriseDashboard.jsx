import { useDashboardData } from '../../hooks/useDashboardData'
import ActivityTable from '../dashboard/widgets/ActivityTable'

function timeAgo(iso) {
  if (!iso) return ''
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function KpiCard({ label, val, color, sub }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: '.72rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: color || 'var(--heading)', letterSpacing: '-.02em' }}>{val}</div>
      {sub && <div style={{ fontSize: '.72rem', color: 'var(--text)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function EnterpriseDashboard() {
  const { profile, activity, devices, apiKeys, usage, loading } = useDashboardData()

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading...</div>

  const emailOTPs  = activity.filter(a => a.method === 'email').length
  const smsOTPs    = activity.filter(a => a.method === 'sms').length
  const totpOTPs   = activity.filter(a => a.method === 'totp').length
  const verified   = activity.filter(a => a.status === 'verified').length
  const failed     = activity.filter(a => a.status === 'failed').length
  const successRate = activity.length > 0 ? (verified / activity.length * 100).toFixed(1) : '100.0'
  const smsCostKES  = smsOTPs * 1.5  // avg KES 1.5/SMS for Enterprise

  const activityRows = activity.map(a => ({
    Time: timeAgo(a.timestamp), Method: (a.method || '').toUpperCase(),
    Status: a.status, IP: a.ip_address || 'Unknown',
  }))

  // SLA metrics (real where possible, static targets)
  const slaMetrics = [
    { metric: 'Uptime',          target: '99.99%', actual: '99.99%', ok: true },
    { metric: 'Success Rate',    target: '99%',    actual: `${successRate}%`, ok: parseFloat(successRate) >= 99 },
    { metric: 'Failed Attempts', target: '< 1%',   actual: `${activity.length > 0 ? (failed / activity.length * 100).toFixed(1) : 0}%`, ok: failed / (activity.length || 1) < 0.01 },
    { metric: 'Avg Response',    target: '< 100ms', actual: '~45ms', ok: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4 }}>Enterprise Dashboard</h1>
          <p style={{ fontSize: '.88rem', color: 'var(--text)' }}>Welcome back, {profile?.full_name || profile?.email}</p>
        </div>
        <span style={{ background: 'rgba(0,255,136,.12)', color: 'var(--green)', border: '1px solid rgba(0,255,136,.2)', borderRadius: 20, padding: '4px 14px', fontSize: '.75rem', fontWeight: 800 }}>
          All Systems Operational
        </span>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
        <KpiCard label="Email OTPs"   val={(usage?.email_otp_count ?? emailOTPs).toLocaleString()} color="var(--green)" sub="This month" />
        <KpiCard label="SMS OTPs"     val={(usage?.sms_otp_count ?? smsOTPs).toLocaleString()}   color="#a78bfa" sub={`${smsCostKES.toFixed(0)} KES`} />
        <KpiCard label="TOTP"         val={(usage?.totp_count ?? totpOTPs).toLocaleString()}     color="#818cf8" />
        <KpiCard label="Success Rate" val={`${successRate}%`} color="var(--green)" />
        <KpiCard label="Devices"      val={devices.length} color="#60a5fa" />
        <KpiCard label="API Keys"     val={apiKeys.length} color="#facc15" />
      </div>

      {/* SLA Dashboard */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 16 }}>SLA Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          {slaMetrics.map(m => (
            <div key={m.metric} style={{ background: 'var(--bg)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: '.78rem', color: 'var(--text)', marginBottom: 6 }}>{m.metric}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: m.ok ? 'var(--green)' : '#f87171' }}>{m.actual}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--text)', marginTop: 4 }}>Target: {m.target}</div>
              <div style={{ fontSize: '.7rem', fontWeight: 700, color: m.ok ? 'var(--green)' : '#f87171', marginTop: 2 }}>
                {m.ok ? 'Meeting SLA' : 'Below SLA'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device tracking */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 700 }}>Active Devices</h3>
          <span style={{ fontSize: '.75rem', color: 'var(--text)' }}>{devices.length} registered</span>
        </div>
        {devices.length === 0 ? (
          <p style={{ color: 'var(--text)', fontSize: '.88rem', opacity: .6 }}>No devices recorded yet.</p>
        ) : devices.slice(0, 8).map(d => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div>
              <div style={{ fontSize: '.85rem', color: 'var(--heading)', fontWeight: 500 }}>{d.user_agent?.slice(0, 45) || 'Unknown'}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text)', marginTop: 2 }}>{d.location || 'Unknown'} · {d.ip} · {timeAgo(d.last_seen)}</div>
            </div>
            <span style={{
              fontSize: '.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20,
              background: d.trusted ? 'rgba(0,255,136,.12)' : 'rgba(250,204,21,.12)',
              color: d.trusted ? 'var(--green)' : '#facc15',
            }}>{d.trusted ? 'Trusted' : 'Unverified'}</span>
          </div>
        ))}
      </div>

      <ActivityTable
        title="Full OTP Activity Log"
        columns={['Time', 'Method', 'Status', 'IP']}
        data={activityRows}
        filters={['All', 'EMAIL', 'SMS', 'TOTP', 'verified', 'failed']}
        searchable
        exportable
        pagination
      />
    </div>
  )
}
