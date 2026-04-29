import MetricCard from '../dashboard/widgets/MetricCard'
import ActivityTable from '../dashboard/widgets/ActivityTable'

export default function GrowthDashboard() {
  const metrics = { activeUsers: 487, maxUsers: 1000, emailOTPs: 12456, smsOTPs: 3234, smsCost: 9702, successRate: 94.2 }

  const recentActivity = [
    { time: '1 min ago',   user: 'user@example.com', method: 'SMS',   status: 'Verified', cost: '3.00 KES' },
    { time: '5 min ago',   user: 'test@example.com', method: 'Email', status: 'Verified', cost: '0' },
    { time: '12 min ago',  user: 'demo@example.com', method: 'SMS',   status: 'Verified', cost: '3.00 KES' },
    { time: '25 min ago',  user: 'john@example.com', method: 'Email', status: 'Failed',   cost: '0' },
    { time: '1 hour ago',  user: 'jane@example.com', method: 'SMS',   status: 'Verified', cost: '3.00 KES' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: '.88rem' }}>Track your OTP usage and performance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
        <MetricCard title="Active Users"  value={`${metrics.activeUsers} / ${metrics.maxUsers.toLocaleString()}`} icon="" trend="+23 this week" trendUp progressBar={(metrics.activeUsers / metrics.maxUsers) * 100} color="blue" />
        <MetricCard title="Email OTPs"    value={metrics.emailOTPs.toLocaleString()} icon="" trend="+15% vs last month" trendUp color="green" />
        <MetricCard title="SMS OTPs"      value={metrics.smsOTPs.toLocaleString()} icon="" subtitle={`Cost: ${metrics.smsCost.toLocaleString()} KES`} badge="NEW" color="purple" />
        <MetricCard title="Success Rate"  value={`${metrics.successRate}%`} icon="✅" trend="+2.1%" trendUp color="emerald" />
      </div>

      {/* SMS Cost Tracking */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>SMS Usage & Costs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 20 }}>
          {[
            { label: 'This Month', val: metrics.smsOTPs.toLocaleString(), sub: 'SMS sent' },
            { label: 'Total Cost', val: `${metrics.smsCost.toLocaleString()} KES`, sub: `Avg: ${(metrics.smsCost / metrics.smsOTPs).toFixed(2)} KES/SMS`, color: '#a78bfa' },
            { label: 'Projected',  val: '~12,000 KES', sub: 'End of month estimate' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '.82rem', color: 'var(--text)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color || 'var(--heading)' }}>{s.val}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <ActivityTable title="Recent OTP Requests" columns={['Time','User','Method','Status','Cost']} data={recentActivity} filters={['All','Email','SMS','Verified','Failed']} searchable exportable pagination />

      {/* Upgrade to Business */}
      <div style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.25)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 8 }}>Unlock Advanced Features</h3>
        <p style={{ fontSize: '.88rem', marginBottom: 14 }}>Upgrade to Business for unlimited users, TOTP, device tracking, and custom branding</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {['Authenticator App (TOTP)','Device Tracking','Custom Branding','Unlimited Users'].map(f => (
            <span key={f} style={{ background: 'rgba(255,255,255,.06)', color: 'var(--heading)', padding: '3px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600 }}>✓ {f}</span>
          ))}
        </div>
        <a href="/#pricing" className="btn-primary" style={{ padding: '10px 24px', fontSize: '.88rem', textDecoration: 'none', display: 'inline-block' }}>
          Upgrade to Business — 5,000 KES/mo
        </a>
      </div>
    </div>
  )
}

