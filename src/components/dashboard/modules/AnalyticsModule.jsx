import { useFeatureGate } from '../../../hooks/useFeatureFlag';
import UpgradePrompt from '../../shared/UpgradePrompt';

export default function AnalyticsModule() {
  const { hasAccess, upgradeInfo } = useFeatureGate('full_dashboard');

  if (!hasAccess) {
    return (
      <UpgradePrompt
        feature="Advanced Analytics"
        description="Get detailed charts, usage trends, and export capabilities."
        upgradeInfo={upgradeInfo}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Advanced analytics dashboard</p>
      </div>
    </div>
  );
}
