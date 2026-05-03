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

function StatCard({ label, val, color, sub, badge }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: '.72rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>{label}</span>
        {badge && <span style={{ fontSize: '.65rem', background: 'rgba(0,255,136,.15)', color: 'var(--green)', padding: '2px 7px', borderRadius: 10, fontWeight: 800 }}>{badge}</span>}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: color || 'var(--heading)' }}>{val}</div>
      {sub && <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function GrowthDashboard() {
  const { profile, activity, devices, apiKeys, statCards, usage, loading } = useDashboardData()

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading...</div>

  // Derive real counts from activity
  const emailOTPs = activity.filter(a => a.method === 'email').length
  const smsOTPs   = activity.filter(a => a.method === 'sms').length
  const verified  = activity.filter(a => a.status === 'verified').length
  const successRate = activity.length > 0 ? Math.round(verified / activity.length * 100) : 100
  const smsCostKES = smsOTPs * 3  // avg KES 3/SMS for Growth plan

  const stats = [
    { label: 'Email OTPs',   val: (usage?.email_otp_count ?? emailOTPs).toLocaleString(), color: 'var(--green)', sub: 'This month' },
    { label: 'SMS OTPs',     val: (usage?.sms_otp_count ?? smsOTPs).toLocaleString(),   color: '#a78bfa', sub: `Cost: ${smsCostKES} KES`, badge: 'SMS' },
    { label: 'Success Rate', val: `${successRate}%`, color: successRate >= 90 ? 'var(--green)' : '#facc15' },
    { label: 'API Keys',     val: apiKeys.length, color: '#facc15' },
  ]

  const activityRows = activity.slice(0, 20).map(a => ({
    Time: timeAgo(a.timestamp), Method: (a.method || '').toUpperCase(),
    Status: a.status, IP: a.ip_address || 'Unknown',
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: '.88rem', color: 'var(--text)' }}>Welcome back, {profile?.full_name || profile?.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* SMS Cost Tracking */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 16 }}>SMS Usage & Costs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 20 }}>
          {[
            { label: 'SMS Sent',    val: (usage?.sms_otp_count ?? smsOTPs).toLocaleString(), sub: 'This month' },
            { label: 'Total Cost',  val: `${smsCostKES.toLocaleString()} KES`, sub: 'Avg: 3 KES/SMS', color: '#a78bfa' },
            { label: 'Rate',        val: `KES 2–5`, sub: 'Per SMS on Growth plan' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '.78rem', color: 'var(--text)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color || 'var(--heading)' }}>{s.val}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <ActivityTable
        title="OTP Activity"
        columns={['Time', 'Method', 'Status', 'IP']}
        data={activityRows}
        filters={['All', 'EMAIL', 'SMS', 'verified', 'failed']}
        searchable
        exportable
        pagination
      />

      {/* Upgrade to Business */}
      <div style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 8 }}>Unlock Advanced Features</h3>
        <p style={{ fontSize: '.88rem', color: 'var(--text)', marginBottom: 14 }}>
          Upgrade to Business for unlimited users, TOTP, device tracking, and custom branding.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {['Authenticator App (TOTP)', 'Device Tracking', 'Custom Branding', 'Unlimited Users'].map(f => (
            <span key={f} style={{ background: 'rgba(255,255,255,.06)', color: 'var(--heading)', padding: '3px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600 }}>
              {f}
            </span>
          ))}
        </div>
        <a href="/#pricing" className="btn-primary" style={{ padding: '10px 24px', fontSize: '.88rem', textDecoration: 'none', display: 'inline-block' }}>
          Upgrade to Business — KES 5,000/mo
        </a>
      </div>
    </div>
  )
}
