import { useFeatureGate } from '../../../hooks/useFeatureFlag';
import UpgradePrompt from '../../shared/UpgradePrompt';

export default function IntegrationsModule() {
  const { hasAccess, upgradeInfo } = useFeatureGate('custom_integrations');

  if (!hasAccess) {
    return (
      <UpgradePrompt
        feature="Custom Integrations"
        description="Connect webhooks, external APIs, and custom integrations."
        upgradeInfo={upgradeInfo}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Manage your integrations and webhooks</p>
      </div>
    </div>
  );
}
