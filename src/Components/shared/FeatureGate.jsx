import { useFeatureGate } from '../../hooks/useFeatureFlag';
import UpgradePrompt from './UpgradePrompt';

export default function FeatureGate({ 
  feature, 
  children, 
  fallback = null,
  showUpgrade = true,
  upgradeStyle = 'banner' // 'banner', 'modal', 'inline'
}) {
  const { hasAccess, isLocked, upgradeInfo } = useFeatureGate(feature);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (showUpgrade && isLocked) {
    return (
      <UpgradePrompt 
        feature={feature}
        upgradeInfo={upgradeInfo}
        style={upgradeStyle}
      />
    );
  }
  
  return fallback;
}
