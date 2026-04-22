import { useContext } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';
import { PLAN_FEATURES } from '../utils/planPermissions';

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  
  return context;
}

export function usePlanAccess(feature) {
  const { currentPlan } = useSubscription();
  const planFeatures = PLAN_FEATURES[currentPlan];
  
  if (!planFeatures) return false;
  
  return planFeatures.features.includes(feature);
}

export function useChannelAccess(channel) {
  const { currentPlan } = useSubscription();
  const planFeatures = PLAN_FEATURES[currentPlan];
  
  if (!planFeatures) return false;
  
  return planFeatures.otpChannels.includes(channel);
}

export function useUserLimit() {
  const { currentPlan } = useSubscription();
  const planFeatures = PLAN_FEATURES[currentPlan];
  
  return {
    maxUsers: planFeatures?.maxUsers || 50,
    isUnlimited: planFeatures?.maxUsers === -1
  };
}

export function usePlanFeatures() {
  const { currentPlan } = useSubscription();
  return PLAN_FEATURES[currentPlan] || PLAN_FEATURES.starter;
}
