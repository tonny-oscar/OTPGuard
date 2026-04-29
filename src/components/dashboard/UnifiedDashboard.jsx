import { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import OverviewModule from './modules/OverviewModule';
import AnalyticsModule from './modules/AnalyticsModule';
import DevicesModule from './modules/DevicesModule';
import BrandingModule from './modules/BrandingModule';
import IntegrationsModule from './modules/IntegrationsModule';
import AuditLogsModule from './modules/AuditLogsModule';
import { useFeatureGate } from '../../hooks/useFeatureFlag';

export default function UnifiedDashboard({ module = 'overview' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentPlan, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderModule = () => {
    switch (module) {
      case 'overview':
        return <OverviewModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'devices':
        return <DevicesModule />;
      case 'branding':
        return <BrandingModule />;
      case 'integrations':
        return <IntegrationsModule />;
      case 'audit':
        return <AuditLogsModule />;
      default:
        return <OverviewModule />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <Sidebar open={false} onClose={() => {}} />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} mobile={true} />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-6">
            {renderModule()}
          </main>
        </div>
      </div>
    </div>
  );
}
