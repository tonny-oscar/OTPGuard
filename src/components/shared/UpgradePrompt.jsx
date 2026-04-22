import { Link } from 'react-router-dom';
import { LockClosedIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

export default function UpgradePrompt({ 
  feature, 
  upgradeInfo,
  style = 'banner',
  title,
  description 
}) {
  const { plan, price } = upgradeInfo || {};
  
  const defaultTitles = {
    sms_otp: 'SMS OTP is locked',
    totp: 'Authenticator App is locked',
    device_tracking: 'Device Tracking is locked',
    custom_branding: 'Custom Branding is locked',
    advanced_analytics: 'Advanced Analytics is locked',
    white_label: 'White-Label is locked'
  };
  
  const defaultDescriptions = {
    sms_otp: 'Send OTP codes via SMS to your users',
    totp: 'Enable authenticator app support (Google Authenticator, Authy)',
    device_tracking: 'Track and monitor user devices and locations',
    custom_branding: 'Customize the look and feel with your brand',
    advanced_analytics: 'Get detailed insights and analytics',
    white_label: 'Remove OTPGuard branding and use your own'
  };
  
  const displayTitle = title || defaultTitles[feature] || 'Feature Locked';
  const displayDescription = description || defaultDescriptions[feature] || 'This feature is not available in your current plan';
  
  if (style === 'banner') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <LockClosedIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {displayTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {displayDescription}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Link
                to={`/upgrade?plan=${plan?.toLowerCase()}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowUpIcon className="h-4 w-4 mr-2" />
                Upgrade to {plan} - {price}
              </Link>
              <Link
                to="/pricing"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Compare plans →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (style === 'inline') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <LockClosedIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-3">{displayDescription}</p>
        <Link
          to={`/upgrade?plan=${plan?.toLowerCase()}`}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Upgrade to {plan} →
        </Link>
      </div>
    );
  }
  
  // Card style
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
        <LockClosedIcon className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>
      <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
        {displayDescription}
      </p>
      <Link
        to={`/upgrade?plan=${plan?.toLowerCase()}`}
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <ArrowUpIcon className="h-4 w-4 mr-2" />
        Upgrade to {plan} - {price}
      </Link>
    </div>
  );
}
