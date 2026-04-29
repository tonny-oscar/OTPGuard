import MetricCard from '../dashboard/widgets/MetricCard'
import ActivityTable from '../dashboard/widgets/ActivityTable'

export default function BusinessDashboard() {
  const metrics = { totalUsers: 12456, emailOTPs: 45678, smsOTPs: 23456, smsCost: 70368, totpVerifications: 8234, successRate: 96.8 }

  const recentActivity = [
    { time: '30 sec ago', user: 'user@example.com', method: 'TOTP',  status: 'Verified', device: 'iPhone 14 Pro',   location: 'Nairobi, KE' },
    { time: '2 min ago',  user: 'test@example.com', method: 'SMS',   status: 'Verified', device: 'Chrome/Windows', location: 'Mombasa, KE' },
    { time: '5 min ago',  user: 'demo@example.com', method: 'Email', status: 'Verified', device: 'Safari/macOS',   location: 'Kisumu, KE' },
    { time: '12 min ago', user: 'john@example.com', method: 'TOTP',  status: 'Verified', device: 'Android 13',     location: 'Nakuru, KE' },
    { time: '18 min ago', user: 'jane@example.com', method: 'SMS',   status: 'Failed',   device: 'Firefox/Linux',  location: 'Eldoret, KE' },
  ]

  const devices = [
    { id: 1, user: 'john@example.com', device: 'iPhone 14 Pro',   location: 'Nairobi, Kenya',  lastSeen: '2 min ago',  trusted: true },
    { id: 2, user: 'jane@example.com', device: 'Chrome/Windows',  location: 'Mombasa, Kenya',  lastSeen: '15 min ago', trusted: true },
    { id: 3, user: 'demo@example.com', device: 'Safari/macOS',    location: 'Kisumu, Kenya',   lastSeen: '1 hour ago', trusted: false },
  ]

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Business Dashboard</h1>
        <p style={{ fontSize: '.88rem' }}>Complete overview of your MFA infrastructure</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
        <MetricCard title="Total Users"         value={metrics.totalUsers.toLocaleString()} icon="" trend="+234 this month" trendUp subtitle="Unlimited" color="blue" />
        <MetricCard title="Email OTPs"          value={metrics.emailOTPs.toLocaleString()} icon="" trend="+12%" trendUp color="green" />
        <MetricCard title="SMS OTPs"            value={metrics.smsOTPs.toLocaleString()} icon="" subtitle={`${metrics.smsCost.toLocaleString()} KES`} color="purple" />
        <MetricCard title="TOTP Verifications"  value={metrics.totpVerifications.toLocaleString()} icon="" badge="NEW" color="indigo" />
        <MetricCard title="Success Rate"        value={`${metrics.successRate}%`} icon="✅" trend="+1.2%" trendUp color="emerald" />
      </div>

      {/* Analytics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>OTP Methods Distribution</h3>
          {[
            { label: 'Email OTP', val: metrics.emailOTPs, pct: 59, color: 'var(--green)' },
            { label: 'SMS OTP',   val: metrics.smsOTPs,   pct: 30, color: '#a78bfa' },
            { label: 'TOTP',      val: metrics.totpVerifications, pct: 11, color: '#818cf8' },
          ].map(m => (
            <div key={m.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: 4 }}>
                <span>{m.label}</span><span style={{ color: m.color, fontWeight: 600 }}>{m.pct}%</span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: 4, height: 6 }}>
                <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={card}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>Top Locations</h3>
          {[{ flag:'', country:'Kenya', users:'8,234', pct:66 }, { flag:'', country:'Uganda', users:'2,456', pct:20 }, { flag:'', country:'Tanzania', users:'1,766', pct:14 }].map(l => (
            <div key={l.country} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>{l.flag}</span>
                <div>
                  <div style={{ fontSize: '.88rem', color: 'var(--heading)', fontWeight: 500 }}>{l.country}</div>
                  <div style={{ fontSize: '.75rem' }}>{l.users} users</div>
                </div>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--heading)' }}>{l.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Device Tracking */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 600 }}>Active Devices</h3>
          <span style={{ background: 'rgba(99,102,241,.15)', color: '#818cf8', padding: '3px 10px', borderRadius: 10, fontSize: '.75rem', fontWeight: 700 }}>Business Feature</span>
        </div>
        {devices.map(d => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.3rem' }}></span>
              <div>
                <div style={{ fontSize: '.88rem', color: 'var(--heading)', fontWeight: 500 }}>{d.device}</div>
                <div style={{ fontSize: '.75rem' }}>{d.location} · {d.lastSeen}</div>
              </div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: '.75rem', fontWeight: 600, background: d.trusted ? 'rgba(0,255,136,.12)' : 'rgba(250,204,21,.12)', color: d.trusted ? 'var(--green)' : '#facc15' }}>
              {d.trusted ? '✓ Trusted' : 'Untrusted'}
            </span>
          </div>
        ))}
      </div>

      <ActivityTable title="Recent OTP Requests" columns={['Time','User','Method','Status','Device','Location']} data={recentActivity} filters={['All','Email','SMS','TOTP','Verified','Failed']} searchable exportable pagination />

      <div style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 6 }}> Custom Branding Active</h3>
        <p style={{ fontSize: '.85rem', marginBottom: 10 }}>Your OTP emails and pages are branded with your company logo and colors</p>
        <a href="/branding" style={{ color: '#a78bfa', fontSize: '.85rem', textDecoration: 'none', fontWeight: 600 }}>Manage Branding →</a>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, textAlign: 'center', fontSize: '.85rem' }}>
        Need white-label or dedicated infrastructure?{' '}
        <a href="mailto:hello@otpguard.co.ke" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Talk to our Enterprise team →</a>
      </div>
    </div>
  )
}

