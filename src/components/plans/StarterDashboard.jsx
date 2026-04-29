import MetricCard from '../dashboard/widgets/MetricCard'
import UpgradeBanner from '../dashboard/widgets/UpgradeBanner'
import ActivityTable from '../dashboard/widgets/ActivityTable'
import FeatureGate from '../shared/FeatureGate'

export default function StarterDashboard() {
  const metrics = { activeUsers: 12, maxUsers: 50, emailOTPs: 234, apiRequests: 1245 }

  const recentActivity = [
    { time: '2 min ago',   email: 'user@example.com', status: 'Verified', method: 'Email' },
    { time: '15 min ago',  email: 'test@example.com', status: 'Pending',  method: 'Email' },
    { time: '1 hour ago',  email: 'demo@example.com', status: 'Verified', method: 'Email' },
    { time: '2 hours ago', email: 'john@example.com', status: 'Failed',   method: 'Email' },
    { time: '3 hours ago', email: 'jane@example.com', status: 'Verified', method: 'Email' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: '.88rem' }}>Welcome to your OTPGuard dashboard</p>
      </div>

      <UpgradeBanner
        title="Unlock SMS OTP & Analytics"
        description="Upgrade to Growth to send SMS OTPs and track detailed analytics"
        features={['SMS OTP', 'Usage Analytics', '1,000 users', 'Cost tracking']}
        ctaText="Upgrade to Growth — 1,500 KES/mo"
        ctaLink="/#pricing"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
        <MetricCard title="Active Users"  value={`${metrics.activeUsers} / ${metrics.maxUsers}`} icon="" trend="+2 this week" trendUp progressBar={(metrics.activeUsers / metrics.maxUsers) * 100} color="blue" />
        <MetricCard title="Email OTPs Sent" value={metrics.emailOTPs.toLocaleString()} icon="" subtitle="This month" color="green" />
        <MetricCard title="API Requests"  value={metrics.apiRequests.toLocaleString()} icon="" subtitle="Last 30 days" color="purple" />
      </div>

      <ActivityTable title="Recent OTP Requests" columns={['Time','Email','Status','Method']} data={recentActivity} maxRows={10} noAnalytics />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
        <FeatureGate feature="sms_otp"            showUpgrade upgradeStyle="inline" />
        <FeatureGate feature="advanced_analytics" showUpgrade upgradeStyle="inline" />
        <FeatureGate feature="device_tracking"    showUpgrade upgradeStyle="inline" />
      </div>
    </div>
  )
}

