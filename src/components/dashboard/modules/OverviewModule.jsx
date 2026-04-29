import { useEffect, useState } from 'react';
import { useSubscription } from '../../../hooks/useSubscription';
import { useFeatureGate } from '../../../hooks/useFeatureFlag';
import MetricCard from '../widgets/MetricCard';
import ActivityTable from '../widgets/ActivityTable';
import UpgradeBanner from '../widgets/UpgradeBanner';
import { 
  EnvelopeIcon, 
  DevicePhoneMobileIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import api from '../../../context/api';

export default function OverviewModule() {
  const { currentPlan, planFeatures } = useSubscription();
  const { hasAccess: hasAnalytics } = useFeatureGate('full_dashboard');
  const { hasAccess: hasSMS } = useFeatureGate('sms_otp');
  const [stats, setStats] = useState({
    totalOTP: 0,
    emailOTP: 0,
    smsOTP: 0,
    successRate: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/mfa/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StarterView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Basic statistics for your OTP requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard title="Total OTP Requests" value={stats.totalOTP} icon={EnvelopeIcon} color="blue" />
        <MetricCard title="Success Rate" value={`${stats.successRate}%`} icon={CheckCircleIcon} color="green" />
      </div>

      <UpgradeBanner
        title="Unlock Advanced Analytics"
        description="Upgrade to Growth plan to access detailed charts, SMS OTP, and usage tracking."
        targetPlan="Growth"
        price="1,500 KES/mo"
      />

      <ActivityTable limit={100} title="Recent Activity (Last 100)" />
    </div>
  );

  const GrowthView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Complete analytics and usage tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total OTP Requests" value={stats.totalOTP} icon={ChartBarIcon} color="blue" trend="+12%" />
        <MetricCard title="Email OTP" value={stats.emailOTP} icon={EnvelopeIcon} color="indigo" />
        <MetricCard title="SMS OTP" value={stats.smsOTP} icon={DevicePhoneMobileIcon} color="purple" />
        <MetricCard title="Success Rate" value={`${stats.successRate}%`} icon={CheckCircleIcon} color="green" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">OTP Usage Over Time</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <ChartBarIcon className="h-16 w-16 mx-auto mb-2" />
            <p>Chart visualization</p>
          </div>
        </div>
      </div>

      <UpgradeBanner
        title="Unlock Device Tracking & Custom Branding"
        description="Upgrade to Business plan for unlimited users, TOTP, device tracking, and geolocation."
        targetPlan="Business"
        price="5,000 KES/mo"
      />

      <ActivityTable limit={500} title="Recent Activity" />
    </div>
  );

  const BusinessView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Advanced analytics, device tracking, and team management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total OTP Requests" value={stats.totalOTP} icon={ChartBarIcon} color="blue" trend="+12%" />
        <MetricCard title="Email OTP" value={stats.emailOTP} icon={EnvelopeIcon} color="indigo" />
        <MetricCard title="SMS OTP" value={stats.smsOTP} icon={DevicePhoneMobileIcon} color="purple" />
        <MetricCard title="Active Users" value={stats.activeUsers} icon={UsersIcon} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Channel</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">Pie chart: Email vs SMS vs TOTP</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">Map visualization</div>
        </div>
      </div>

      <UpgradeBanner
        title="Unlock Enterprise Features"
        description="Get white-label mode, dedicated support, SLA monitoring, and custom integrations."
        targetPlan="Enterprise"
        price="Custom"
      />

      <ActivityTable limit={1000} title="Recent Activity" />
    </div>
  );

  const EnterpriseView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Complete control with SLA monitoring and custom integrations</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          99.9% Uptime
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total OTP Requests" value={stats.totalOTP} icon={ChartBarIcon} color="blue" trend="+12%" />
        <MetricCard title="Email OTP" value={stats.emailOTP} icon={EnvelopeIcon} color="indigo" />
        <MetricCard title="SMS OTP" value={stats.smsOTP} icon={DevicePhoneMobileIcon} color="purple" />
        <MetricCard title="Active Users" value={stats.activeUsers} icon={UsersIcon} color="green" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Monitoring</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">45ms</div>
            <div className="text-sm text-gray-500">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-500">Incidents</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Usage</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">Advanced regional analytics</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Integrations</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">Webhook & API integration status</div>
        </div>
      </div>

      <ActivityTable limit={-1} title="Complete Activity Log" />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  switch (currentPlan) {
    case 'starter':
      return <StarterView />;
    case 'growth':
      return <GrowthView />;
    case 'business':
      return <BusinessView />;
    case 'enterprise':
      return <EnterpriseView />;
    default:
      return <StarterView />;
  }
}
