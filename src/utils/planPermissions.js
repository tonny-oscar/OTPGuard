export const PLAN_FEATURES = {
  starter: {
    name: 'Starter',
    maxUsers: 50,
    otpChannels: ['email'],
    features: [
      'basic_dashboard',
      'email_otp',
      'api_keys',
      'basic_logs'
    ],
    analytics: false,
    deviceTracking: false,
    customBranding: false,
    smsEnabled: false,
    totpEnabled: false,
    backupCodes: false,
    teamManagement: false,
    auditLogs: false,
    whiteLabel: false
  },
  
  growth: {
    name: 'Growth',
    maxUsers: 1000,
    otpChannels: ['email', 'sms'],
    features: [
      'basic_dashboard',
      'full_dashboard',
      'email_otp',
      'sms_otp',
      'api_keys',
      'usage_tracking',
      'basic_analytics',
      'sms_cost_tracking',
      'enhanced_logs'
    ],
    analytics: 'basic',
    deviceTracking: false,
    customBranding: false,
    smsEnabled: true,
    totpEnabled: false,
    backupCodes: false,
    teamManagement: false,
    auditLogs: false,
    whiteLabel: false
  },
  
  business: {
    name: 'Business',
    maxUsers: -1, // unlimited
    otpChannels: ['email', 'sms', 'totp'],
    features: [
      'basic_dashboard',
      'full_dashboard',
      'admin_dashboard',
      'email_otp',
      'sms_otp',
      'totp',
      'backup_codes',
      'api_keys',
      'usage_tracking',
      'advanced_analytics',
      'device_tracking',
      'geolocation',
      'custom_branding',
      'priority_support',
      'enhanced_logs'
    ],
    analytics: 'advanced',
    deviceTracking: true,
    customBranding: true,
    smsEnabled: true,
    totpEnabled: true,
    backupCodes: true,
    teamManagement: false,
    auditLogs: false,
    whiteLabel: false
  },
  
  enterprise: {
    name: 'Enterprise',
    maxUsers: -1,
    otpChannels: ['email', 'sms', 'totp'],
    features: [
      'basic_dashboard',
      'full_dashboard',
      'admin_dashboard',
      'email_otp',
      'sms_otp',
      'totp',
      'backup_codes',
      'api_keys',
      'usage_tracking',
      'advanced_analytics',
      'device_tracking',
      'geolocation',
      'custom_branding',
      'priority_support',
      'enhanced_logs',
      'white_label',
      'dedicated_support',
      'sla_monitoring',
      'custom_integrations',
      'advanced_reporting',
      'system_health',
      'audit_logs',
      'team_management',
      'role_management'
    ],
    analytics: 'enterprise',
    deviceTracking: true,
    customBranding: true,
    smsEnabled: true,
    totpEnabled: true,
    backupCodes: true,
    teamManagement: true,
    auditLogs: true,
    whiteLabel: true
  }
};

export const hasFeature = (plan, feature) => {
  return PLAN_FEATURES[plan]?.features.includes(feature) || false;
};

export const canUseChannel = (plan, channel) => {
  return PLAN_FEATURES[plan]?.otpChannels.includes(channel) || false;
};

export const getPlanName = (plan) => {
  return PLAN_FEATURES[plan]?.name || 'Unknown';
};

export const getMaxUsers = (plan) => {
  return PLAN_FEATURES[plan]?.maxUsers || 50;
};

export const isUnlimitedUsers = (plan) => {
  return PLAN_FEATURES[plan]?.maxUsers === -1;
};

export const getAnalyticsLevel = (plan) => {
  return PLAN_FEATURES[plan]?.analytics || false;
};

export const PLAN_COLORS = {
  starter: 'blue',
  growth: 'green',
  business: 'purple',
  enterprise: 'gold'
};

export const PLAN_PRICES = {
  starter: { kes: 0, usd: 0 },
  growth: { kes: 1500, usd: 10 },
  business: { kes: 5000, usd: 35 },
  enterprise: { kes: 'Custom', usd: 'Custom' }
};
