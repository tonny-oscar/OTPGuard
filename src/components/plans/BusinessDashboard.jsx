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

function StatCard({ label, val, color, sub }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: '.72rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: color || 'var(--heading)' }}>{val}</div>
      {sub && <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function BusinessDashboard() {
  const { profile, activity, devices, apiKeys, usage, loading } = useDashboardData()

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading...</div>

  const emailOTPs  = activity.filter(a => a.method === 'email').length
  const smsOTPs    = activity.filter(a => a.method === 'sms').length
  const totpOTPs   = activity.filter(a => a.method === 'totp').length
  const verified   = activity.filter(a => a.status === 'verified').length
  const successRate = activity.length > 0 ? Math.round(verified / activity.length * 100) : 100
  const smsCostKES  = smsOTPs * 2  // avg KES 2/SMS for Business plan
  const total       = emailOTPs + smsOTPs + totpOTPs || 1

  const activityRows = activity.slice(0, 50).map(a => ({
    Time: timeAgo(a.timestamp), Method: (a.method || '').toUpperCase(),
    Status: a.status, IP: a.ip_address || 'Unknown',
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4 }}>Business Dashboard</h1>
        <p style={{ fontSize: '.88rem', color: 'var(--text)' }}>Welcome back, {profile?.full_name || profile?.email}</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
        <StatCard label="Email OTPs"   val={(usage?.email_otp_count ?? emailOTPs).toLocaleString()} color="var(--green)" sub="This month" />
        <StatCard label="SMS OTPs"     val={(usage?.sms_otp_count ?? smsOTPs).toLocaleString()}   color="#a78bfa" sub={`${smsCostKES} KES cost`} />
        <StatCard label="TOTP Verif."  val={(usage?.totp_count ?? totpOTPs).toLocaleString()}     color="#818cf8" />
        <StatCard label="Success Rate" val={`${successRate}%`} color={successRate >= 90 ? 'var(--green)' : '#facc15'} />
        <StatCard label="API Keys"     val={apiKeys.length} color="#facc15" />
      </div>

      {/* OTP method breakdown */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 16 }}>OTP Method Distribution</h3>
        {[
          { label: 'Email OTP', count: emailOTPs, color: 'var(--green)' },
          { label: 'SMS OTP',   count: smsOTPs,   color: '#a78bfa' },
          { label: 'TOTP',      count: totpOTPs,  color: '#818cf8' },
        ].map(m => {
          const pct = Math.round(m.count / total * 100)
          return (
            <div key={m.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: 5 }}>
                <span style={{ color: 'var(--heading)', fontWeight: 500 }}>{m.label}</span>
                <span style={{ color: m.color, fontWeight: 700 }}>{m.count.toLocaleString()} ({pct}%)</span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: m.color, borderRadius: 4, transition: 'width .5s' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Device tracking */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 700 }}>Active Devices</h3>
          <span style={{ fontSize: '.75rem', color: 'var(--text)' }}>{devices.length} total</span>
        </div>
        {devices.length === 0 ? (
          <p style={{ color: 'var(--text)', fontSize: '.88rem', opacity: .6 }}>No devices recorded yet.</p>
        ) : devices.slice(0, 5).map(d => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '.85rem', color: 'var(--heading)', fontWeight: 500 }}>{d.user_agent?.slice(0, 40) || 'Unknown'}</div>
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
        title="OTP Activity"
        columns={['Time', 'Method', 'Status', 'IP']}
        data={activityRows}
        filters={['All', 'EMAIL', 'SMS', 'TOTP', 'verified', 'failed']}
        searchable
        exportable
        pagination
      />

      {/* Enterprise teaser */}
      <div style={{ background: 'rgba(250,204,21,.05)', border: '1px solid rgba(250,204,21,.15)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: '.88rem', color: 'var(--text)' }}>
          Need white-label, dedicated infrastructure, or SLA 99.99%?{' '}
          <a href="mailto:hello@otpguard.co.ke" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
            Contact our Enterprise team
          </a>
        </p>
      </div>
    </div>
  )
}
