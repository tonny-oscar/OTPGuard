import { useFeatureGate } from '../../../hooks/useFeatureFlag';
import UpgradePrompt from '../../shared/UpgradePrompt';

export default function AuditLogsModule() {
  const { hasAccess, upgradeInfo } = useFeatureGate('audit_logs');

  if (!hasAccess) {
    return (
      <UpgradePrompt
        feature="Audit Logs"
        description="Access complete audit trail with full history tracking."
        upgradeInfo={upgradeInfo}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Complete audit trail and compliance logs</p>
      </div>
    </div>
  );
}
