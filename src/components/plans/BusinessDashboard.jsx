import { 
  UsersIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon, 
  ShieldCheckIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import MetricCard from '../dashboard/widgets/MetricCard';
import ActivityTable from '../dashboard/widgets/ActivityTable';

export default function BusinessDashboard() {
  // Mock data - replace with real API calls
  const metrics = {
    totalUsers: 12456,
    emailOTPs: 45678,
    smsOTPs: 23456,
    smsCost: 70368,
    totpVerifications: 8234,
    successRate: 96.8
  };
  
  const recentActivity = [
    { time: '30 sec ago', user: 'user@example.com', method: 'TOTP', status: 'Verified', device: 'iPhone 14 Pro', location: 'Nairobi, KE' },
    { time: '2 min ago', user: 'test@example.com', method: 'SMS', status: 'Verified', device: 'Chrome/Windows', location: 'Mombasa, KE' },
    { time: '5 min ago', user: 'demo@example.com', method: 'Email', status: 'Verified', device: 'Safari/macOS', location: 'Kisumu, KE' },
    { time: '12 min ago', user: 'john@example.com', method: 'TOTP', status: 'Verified', device: 'Android 13', location: 'Nakuru, KE' },
    { time: '18 min ago', user: 'jane@example.com', method: 'SMS', status: 'Failed', device: 'Firefox/Linux', location: 'Eldoret, KE' }
  ];
  
  const devices = [
    { id: 1, user: 'john@example.com', device: 'iPhone 14 Pro', location: 'Nairobi, Kenya', lastSeen: '2 min ago', trusted: true, ip: '197.232.xxx.xxx' },
    { id: 2, user: 'jane@example.com', device: 'Chrome/Windows', location: 'Mombasa, Kenya', lastSeen: '15 min ago', trusted: true, ip: '197.232.xxx.xxx' },
    { id: 3, user: 'demo@example.com', device: 'Safari/macOS', location: 'Kisumu, Kenya', lastSeen: '1 hour ago', trusted: false, ip: '197.232.xxx.xxx' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Complete overview of your MFA infrastructure
        </p>
      </div>
      
      {/* Executive Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          icon={UsersIcon}
          trend="+234 this month"
          trendUp={true}
          subtitle="Unlimited"
          color="blue"
        />
        
        <MetricCard
          title="Email OTPs"
          value={metrics.emailOTPs.toLocaleString()}
          icon={EnvelopeIcon}
          trend="+12%"
          trendUp={true}
          color="green"
        />
        
        <MetricCard
          title="SMS OTPs"
          value={metrics.smsOTPs.toLocaleString()}
          icon={DevicePhoneMobileIcon}
          subtitle={`${metrics.smsCost.toLocaleString()} KES`}
          color="purple"
        />
        
        <MetricCard
          title="TOTP Verifications"
          value={metrics.totpVerifications.toLocaleString()}
          icon={ShieldCheckIcon}
          badge="NEW"
          color="indigo"
        />
        
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={CheckCircleIcon}
          trend="+1.2%"
          trendUp={true}
          color="emerald"
        />
      </div>
      
      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OTP Methods Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">OTP Methods Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Email OTP</span>
                <span className="font-medium text-gray-900">{metrics.emailOTPs.toLocaleString()} (59%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '59%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">SMS OTP</span>
                <span className="font-medium text-gray-900">{metrics.smsOTPs.toLocaleString()} (30%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">TOTP</span>
                <span className="font-medium text-gray-900">{metrics.totpVerifications.toLocaleString()} (11%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '11%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇰🇪</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Kenya</p>
                  <p className="text-xs text-gray-500">8,234 users</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">66%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇺🇬</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Uganda</p>
                  <p className="text-xs text-gray-500">2,456 users</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇹🇿</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Tanzania</p>
                  <p className="text-xs text-gray-500">1,766 users</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">14%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Device Tracking Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Devices</h3>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
            Business Feature
          </span>
        </div>
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💻</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{device.device}</p>
                  <p className="text-xs text-gray-500">{device.location} • {device.ip} • {device.lastSeen}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {device.trusted ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    ✓ Trusted
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    Untrusted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Activity with Full Features */}
      <ActivityTable
        title="Recent OTP Requests"
        columns={['Time', 'User', 'Method', 'Status', 'Device', 'Location']}
        data={recentActivity}
        filters={['All', 'Email', 'SMS', 'TOTP', 'Verified', 'Failed']}
        searchable={true}
        exportable={true}
        pagination={true}
      />
      
      {/* Custom Branding Preview */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Custom Branding Active
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your OTP emails and pages are branded with your company logo and colors
            </p>
            <a
              href="/branding"
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Manage Branding →
            </a>
          </div>
          <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg border-2 border-purple-200 flex items-center justify-center">
            <span className="text-2xl">🎨</span>
          </div>
        </div>
      </div>
      
      {/* Subtle Enterprise Teaser */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          Need white-label or dedicated infrastructure? 
          <a href="/contact-sales" className="ml-1 text-indigo-600 hover:text-indigo-700 font-medium">
            Talk to our Enterprise team →
          </a>
        </p>
      </div>
    </div>
  );
}
