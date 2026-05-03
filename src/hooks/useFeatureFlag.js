import { usePlanAccess, useChannelAccess, usePlanFeatures } from './useSubscription';

export function useFeatureFlag(feature) {
  const hasAccess = usePlanAccess(feature);
  
  return {
    hasAccess,
    isLocked: !hasAccess
  };
}

export function useFeatureGate(feature) {
  const { hasAccess, isLocked } = useFeatureFlag(feature);
  
  const getUpgradeMessage = () => {
    const upgradeMap = {
      sms_otp: { plan: 'Growth', price: '1,500 KES/mo' },
      totp: { plan: 'Business', price: '5,000 KES/mo' },
      device_tracking: { plan: 'Business', price: '5,000 KES/mo' },
      custom_branding: { plan: 'Business', price: '5,000 KES/mo' },
      white_label: { plan: 'Enterprise', price: 'Custom' },
      advanced_analytics: { plan: 'Business', price: '5,000 KES/mo' }
    };
    
    return upgradeMap[feature] || { plan: 'Growth', price: '1,500 KES/mo' };
  };
  
  return {
    hasAccess,
    isLocked,
    upgradeInfo: isLocked ? getUpgradeMessage() : null
  };
}

export function useChannelGate(channel) {
  const hasAccess = useChannelAccess(channel);
  
  const getChannelUpgradeInfo = () => {
    const channelMap = {
      sms: { plan: 'Growth', price: '1,500 KES/mo' },
      totp: { plan: 'Business', price: '5,000 KES/mo' }
    };
    
    return channelMap[channel] || { plan: 'Growth', price: '1,500 KES/mo' };
  };
  
  return {
    hasAccess,
    isLocked: !hasAccess,
    upgradeInfo: !hasAccess ? getChannelUpgradeInfo() : null
  };
}

export function useAnalyticsAccess() {
  const features = usePlanFeatures();
  
  return {
    hasBasicAnalytics: features.analytics === 'basic' || features.analytics === 'advanced' || features.analytics === 'enterprise',
    hasAdvancedAnalytics: features.analytics === 'advanced' || features.analytics === 'enterprise',
    hasEnterpriseAnalytics: features.analytics === 'enterprise',
    analyticsLevel: features.analytics || 'none'
  };
}
