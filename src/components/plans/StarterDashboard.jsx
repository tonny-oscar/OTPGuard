import { UsersIcon, EnvelopeIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import MetricCard from '../dashboard/widgets/MetricCard';
import UpgradeBanner from '../dashboard/widgets/UpgradeBanner';
import ActivityTable from '../dashboard/widgets/ActivityTable';
import FeatureGate from '../shared/FeatureGate';

export default function StarterDashboard() {
  // Mock data - replace with real API calls
  const metrics = {
    activeUsers: 12,
    maxUsers: 50,
    emailOTPs: 234,
    apiRequests: 1245
  };
  
  const recentActivity = [
    { time: '2 min ago', email: 'user@example.com', status: 'Verified', method: 'Email' },
    { time: '15 min ago', email: 'test@example.com', status: 'Pending', method: 'Email' },
    { time: '1 hour ago', email: 'demo@example.com', status: 'Verified', method: 'Email' },
    { time: '2 hours ago', email: 'john@example.com', status: 'Failed', method: 'Email' },
    { time: '3 hours ago', email: 'jane@example.com', status: 'Verified', method: 'Email' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your OTPGuard dashboard
        </p>
      </div>
      
      {/* Upgrade Banner */}
      <UpgradeBanner
        title="Unlock SMS OTP & Analytics"
        description="Upgrade to Growth to send SMS OTPs and track detailed analytics"
        features={['SMS OTP', 'Usage Analytics', '1,000 users', 'Cost tracking']}
        ctaText="Upgrade to Growth - 1,500 KES/mo"
        ctaLink="/upgrade?plan=growth"
      />
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Users"
          value={`${metrics.activeUsers} / ${metrics.maxUsers}`}
          icon={UsersIcon}
          trend="+2 this week"
          trendUp={true}
          progressBar={(metrics.activeUsers / metrics.maxUsers) * 100}
          color="blue"
        />
        
        <MetricCard
          title="Email OTPs Sent"
          value={metrics.emailOTPs.toLocaleString()}
          icon={EnvelopeIcon}
          subtitle="This month"
          color="green"
        />
        
        <MetricCard
          title="API Requests"
          value={metrics.apiRequests.toLocaleString()}
          icon={CodeBracketIcon}
          subtitle="Last 30 days"
          color="purple"
        />
      </div>
      
      {/* Recent Activity */}
      <ActivityTable
        title="Recent OTP Requests"
        columns={['Time', 'Email', 'Status', 'Method']}
        data={recentActivity}
        maxRows={10}
        noAnalytics={true}
      />
      
      {/* Locked Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureGate feature="sms_otp" showUpgrade={true} upgradeStyle="inline" />
        <FeatureGate feature="advanced_analytics" showUpgrade={true} upgradeStyle="inline" />
        <FeatureGate feature="device_tracking" showUpgrade={true} upgradeStyle="inline" />
      </div>
    </div>
  );
}
