import { useDashboardData } from '../../hooks/useDashboardData'
import ActivityTable from '../dashboard/widgets/ActivityTable'
import UpgradeBanner from '../dashboard/widgets/UpgradeBanner'

function timeAgo(iso) {
  if (!iso) return ''
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function StatCard({ label, val, color }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: '.72rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: color || 'var(--heading)' }}>{val}</div>
    </div>
  )
}

function LockedCard({ title, desc, plan, price }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--heading)' }}>{title}</span>
        <span style={{ fontSize: '.68rem', background: 'rgba(255,255,255,.06)', color: 'var(--text)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>LOCKED</span>
      </div>
      <p style={{ fontSize: '.8rem', color: 'var(--text)', marginBottom: 12, lineHeight: 1.5 }}>{desc}</p>
      <a href="/#pricing" style={{ fontSize: '.78rem', color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
        Upgrade to {plan} — {price}
      </a>
    </div>
  )
}

export default function StarterDashboard() {
  const { profile, activity, devices, apiKeys, statCards, loading } = useDashboardData()

  const stats = statCards.length > 0 ? statCards : [
    { label: 'MFA Status',      val: profile?.mfa_enabled ? 'Active' : 'Disabled', color: profile?.mfa_enabled ? 'var(--green)' : '#f87171' },
    { label: 'MFA Method',      val: (profile?.mfa_method || 'email').toUpperCase(), color: 'var(--blue)' },
    { label: 'Trusted Devices', val: devices.filter(d => d.trusted).length, color: 'var(--green)' },
    { label: 'API Keys',        val: apiKeys.length, color: '#facc15' },
  ]

  const activityRows = activity.slice(0, 10).map(a => ({
    Time: timeAgo(a.timestamp), Method: (a.method || '').toUpperCase(),
    Status: a.status, IP: a.ip_address || 'Unknown',
  }))

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: '.88rem', color: 'var(--text)' }}>Welcome back, {profile?.full_name || profile?.email}</p>
      </div>

      <UpgradeBanner
        title="Unlock SMS OTP and Analytics"
        description="Upgrade to Growth to send SMS OTPs, track usage analytics, and support up to 1,000 users."
        features={['SMS OTP', 'Usage Analytics', '1,000 users', 'SMS cost tracking']}
        ctaText="Upgrade to Growth — KES 1,500/mo"
        ctaLink="/#pricing"
        dismissible
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <ActivityTable
        title="Recent OTP Activity"
        columns={['Time', 'Method', 'Status', 'IP']}
        data={activityRows}
        maxRows={10}
        noAnalytics
      />

      <div>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 14, fontSize: '1rem' }}>Available on Higher Plans</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
          <LockedCard title="SMS OTP"           desc="Send one-time codes via SMS to any phone number."     plan="Growth"   price="KES 1,500/mo" />
          <LockedCard title="Usage Analytics"   desc="Track OTP usage, success rates, and cost breakdowns." plan="Growth"   price="KES 1,500/mo" />
          <LockedCard title="Device Tracking"   desc="Monitor trusted devices and flag suspicious logins."  plan="Business" price="KES 5,000/mo" />
          <LockedCard title="Authenticator App" desc="Support Google Authenticator and Authy via TOTP."     plan="Business" price="KES 5,000/mo" />
        </div>
      </div>
    </div>
  )
}
