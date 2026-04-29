import { useFeatureGate } from '../../../hooks/useFeatureFlag';
import UpgradePrompt from '../../shared/UpgradePrompt';

export default function DevicesModule() {
  const { hasAccess, upgradeInfo } = useFeatureGate('device_tracking');

  if (!hasAccess) {
    return (
      <UpgradePrompt
        feature="Device Tracking"
        description="Track user devices, login history, and geolocation data."
        upgradeInfo={upgradeInfo}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users & Devices</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Device tracking and management</p>
      </div>
    </div>
  );
}
