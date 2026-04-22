import { UsersIcon, EnvelopeIcon, DevicePhoneMobileIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import MetricCard from '../dashboard/widgets/MetricCard';
import ActivityTable from '../dashboard/widgets/ActivityTable';

export default function GrowthDashboard() {
  // Mock data - replace with real API calls
  const metrics = {
    activeUsers: 487,
    maxUsers: 1000,
    emailOTPs: 12456,
    smsOTPs: 3234,
    smsCost: 9702,
    successRate: 94.2
  };
  
  const recentActivity = [
    { time: '1 min ago', user: 'user@example.com', method: 'SMS', status: 'Verified', cost: '3.00 KES' },
    { time: '5 min ago', user: 'test@example.com', method: 'Email', status: 'Verified', cost: '0' },
    { time: '12 min ago', user: 'demo@example.com', method: 'SMS', status: 'Verified', cost: '3.00 KES' },
    { time: '25 min ago', user: 'john@example.com', method: 'Email', status: 'Failed', cost: '0' },
    { time: '1 hour ago', user: 'jane@example.com', method: 'SMS', status: 'Verified', cost: '3.00 KES' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track your OTP usage and performance
        </p>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Active Users"
          value={`${metrics.activeUsers} / ${metrics.maxUsers.toLocaleString()}`}
          icon={UsersIcon}
          trend="+23 this week"
          trendUp={true}
          progressBar={(metrics.activeUsers / metrics.maxUsers) * 100}
          color="blue"
        />
        
        <MetricCard
          title="Email OTPs"
          value={metrics.emailOTPs.toLocaleString()}
          icon={EnvelopeIcon}
          trend="+15% vs last month"
          trendUp={true}
          color="green"
        />
        
        <MetricCard
          title="SMS OTPs"
          value={metrics.smsOTPs.toLocaleString()}
          icon={DevicePhoneMobileIcon}
          subtitle={`Cost: ${metrics.smsCost.toLocaleString()} KES`}
          badge="NEW"
          color="purple"
        />
        
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={CheckCircleIcon}
          trend="+2.1%"
          trendUp={true}
          color="emerald"
        />
      </div>
      
      {/* SMS Cost Tracking Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Usage & Costs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.smsOTPs.toLocaleString()}</p>
            <p className="text-xs text-gray-500">SMS sent</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-2xl font-bold text-purple-600">{metrics.smsCost.toLocaleString()} KES</p>
            <p className="text-xs text-gray-500">Avg: {(metrics.smsCost / metrics.smsOTPs).toFixed(2)} KES/SMS</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Projected</p>
            <p className="text-2xl font-bold text-gray-900">~12,000 KES</p>
            <p className="text-xs text-gray-500">End of month estimate</p>
          </div>
        </div>
      </div>
      
      {/* Recent Activity with Enhanced Filters */}
      <ActivityTable
        title="Recent OTP Requests"
        columns={['Time', 'User', 'Method', 'Status', 'Cost']}
        data={recentActivity}
        filters={['All', 'Email', 'SMS', 'Verified', 'Failed']}
        searchable={true}
        exportable={true}
        pagination={true}
      />
      
      {/* Upgrade Prompt for Business Features */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unlock Advanced Features
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upgrade to Business for unlimited users, TOTP, device tracking, and custom branding
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-indigo-700 border border-indigo-200">
                ✓ Authenticator App (TOTP)
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-indigo-700 border border-indigo-200">
                ✓ Device Tracking
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-indigo-700 border border-indigo-200">
                ✓ Custom Branding
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-indigo-700 border border-indigo-200">
                ✓ Unlimited Users
              </span>
            </div>
            <a
              href="/upgrade?plan=business"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Upgrade to Business - 5,000 KES/mo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
