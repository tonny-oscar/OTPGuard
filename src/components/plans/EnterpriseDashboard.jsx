import { 
  UsersIcon, 
  ServerIcon,
  ClockIcon,
  KeyIcon,
  CurrencyDollarIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import MetricCard from '../dashboard/widgets/MetricCard';
import ActivityTable from '../dashboard/widgets/ActivityTable';

export default function EnterpriseDashboard() {
  // Mock data - replace with real API calls
  const metrics = {
    totalUsers: 125456,
    uptime: 99.99,
    avgResponseTime: 45,
    totalOTPs: 1200000,
    smsCost: 234567,
    successRate: 98.2
  };
  
  const systemHealth = [
    { name: 'API Gateway', status: 'healthy', uptime: '99.99%', responseTime: '42ms' },
    { name: 'Database', status: 'healthy', uptime: '100%', connections: 234 },
    { name: 'SMS Provider', status: 'healthy', uptime: '99.95%', queue: 12 },
    { name: 'Email Service', status: 'healthy', uptime: '99.98%', queue: 45 }
  ];
  
  const slaMetrics = [
    { metric: 'Uptime', target: '99.9%', actual: '99.99%', status: 'exceeding' },
    { metric: 'Response Time', target: '<100ms', actual: '45ms', status: 'exceeding' },
    { metric: 'Error Rate', target: '<0.1%', actual: '0.03%', status: 'meeting' },
    { metric: 'Support Response', target: '<1hr', actual: '23min', status: 'exceeding' }
  ];
  
  const teamMembers = [
    { name: 'John Doe', role: 'Admin', email: 'john@acme.com', lastActive: '5 min ago' },
    { name: 'Jane Smith', role: 'Developer', email: 'jane@acme.com', lastActive: '2 hrs ago' },
    { name: 'Bob Johnson', role: 'Viewer', email: 'bob@acme.com', lastActive: '1 day ago' }
  ];
  
  const auditLogs = [
    { time: '2 min ago', user: 'admin@acme.com', action: 'API Key Created', ip: '197.232.xxx.xxx' },
    { time: '15 min ago', user: 'dev@acme.com', action: 'Settings Updated', ip: '197.232.xxx.xxx' },
    { time: '1 hour ago', user: 'admin@acme.com', action: 'User Role Changed', ip: '197.232.xxx.xxx' },
    { time: '3 hours ago', user: 'dev@acme.com', action: 'Integration Added', ip: '197.232.xxx.xxx' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Mission-critical MFA infrastructure monitoring and management
        </p>
      </div>
      
      {/* Executive KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          icon={UsersIcon}
          trend="+2,345 this month"
          trendUp={true}
          color="blue"
          size="large"
        />
        
        <MetricCard
          title="Uptime"
          value={`${metrics.uptime}%`}
          icon={ServerIcon}
          subtitle="SLA: 99.9%"
          badge="✓ On Track"
          color="green"
        />
        
        <MetricCard
          title="Avg Response Time"
          value={`${metrics.avgResponseTime}ms`}
          icon={ClockIcon}
          trend="-5ms"
          trendUp={true}
          color="purple"
        />
        
        <MetricCard
          title="Total OTPs"
          value={`${(metrics.totalOTPs / 1000000).toFixed(1)}M`}
          icon={KeyIcon}
          subtitle="This month"
          color="indigo"
        />
        
        <MetricCard
          title="SMS Cost"
          value={`${metrics.smsCost.toLocaleString()} KES`}
          icon={CurrencyDollarIcon}
          trend="+12%"
          trendUp={false}
          color="amber"
        />
        
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={CheckCircleIcon}
          trend="+0.5%"
          trendUp={true}
          color="emerald"
        />
      </div>
      
      {/* System Health Monitoring */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Infrastructure Status</h3>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            All Systems Operational
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemHealth.map((service) => (
            <div key={service.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-600">Uptime: <span className="font-semibold text-gray-900">{service.uptime}</span></p>
                {service.responseTime && (
                  <p className="text-xs text-gray-600">Response: <span className="font-semibold text-gray-900">{service.responseTime}</span></p>
                )}
                {service.connections && (
                  <p className="text-xs text-gray-600">Connections: <span className="font-semibold text-gray-900">{service.connections}</span></p>
                )}
                {service.queue !== undefined && (
                  <p className="text-xs text-gray-600">Queue: <span className="font-semibold text-gray-900">{service.queue}</span></p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            ℹ️ Scheduled maintenance: Sunday 2AM-4AM EAT
          </p>
        </div>
      </div>
      
      {/* SLA Compliance Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Performance (Last 30 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {slaMetrics.map((metric) => (
            <div key={metric.metric} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">{metric.metric}</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-gray-900">{metric.actual}</span>
                <span className="text-xs text-gray-500">/ {metric.target}</span>
              </div>
              <div className="flex items-center gap-1">
                {metric.status === 'exceeding' ? (
                  <>
                    <span className="text-xs font-medium text-green-600">↗ Exceeding</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  </>
                ) : (
                  <>
                    <span className="text-xs font-medium text-blue-600">✓ Meeting</span>
                    <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Team Management Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team & Roles</h3>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            + Add Member
          </button>
        </div>
        <div className="space-y-3">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {member.role}
                </span>
                <span className="text-xs text-gray-500">{member.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Audit Log Viewer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Security Audit Log</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Export All →
          </button>
        </div>
        <ActivityTable
          title=""
          columns={['Time', 'User', 'Action', 'IP Address']}
          data={auditLogs}
          searchable={true}
          exportable={true}
          pagination={true}
        />
      </div>
      
      {/* White-Label Configuration */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏷️</span>
              <h3 className="text-lg font-semibold text-gray-900">White-Label Active</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Your custom domain: <span className="font-mono font-semibold text-gray-900">auth.acme.com</span>
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                ✓ Custom Domain
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                ✓ No OTPGuard Branding
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                ✓ Custom Email Templates
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                ✓ Custom SMS Sender ID
              </span>
            </div>
            <a
              href="/white-label"
              className="inline-flex items-center text-sm text-yellow-700 hover:text-yellow-800 font-medium"
            >
              Manage White-Label Settings →
            </a>
          </div>
        </div>
      </div>
      
      {/* Custom Integrations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💬</span>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Slack Notifications</h4>
            <p className="text-xs text-gray-600">Active</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔗</span>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Webhook Endpoints</h4>
            <p className="text-xs text-gray-600">3 configured</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔐</span>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">SAML SSO</h4>
            <p className="text-xs text-gray-600">Okta</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⚡</span>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Custom API</h4>
            <p className="text-xs text-gray-600">v2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
