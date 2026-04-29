import { useFeatureGate } from '../../../hooks/useFeatureFlag';
import UpgradePrompt from '../../shared/UpgradePrompt';

export default function BrandingModule() {
  const { hasAccess, upgradeInfo } = useFeatureGate('custom_branding');

  if (!hasAccess) {
    return (
      <UpgradePrompt
        feature="Custom Branding"
        description="Upload your logo and customize OTP messages with your brand."
        upgradeInfo={upgradeInfo}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Branding</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Customize your brand appearance</p>
      </div>
    </div>
  );
}
