import { Link } from 'react-router-dom'

const defaultTitles = {
  sms_otp: 'SMS OTP is locked',
  totp: 'Authenticator App is locked',
  device_tracking: 'Device Tracking is locked',
  custom_branding: 'Custom Branding is locked',
  advanced_analytics: 'Advanced Analytics is locked',
  white_label: 'White-Label is locked',
}

const defaultDescriptions = {
  sms_otp: 'Send OTP codes via SMS to your users',
  totp: 'Enable authenticator app support (Google Authenticator, Authy)',
  device_tracking: 'Track and monitor user devices and locations',
  custom_branding: 'Customize the look and feel with your brand',
  advanced_analytics: 'Get detailed insights and analytics',
  white_label: 'Remove OTPGuard branding and use your own',
}

export default function UpgradePrompt({ feature, upgradeInfo, style = 'banner', title, description }) {
  const { plan, price } = upgradeInfo || {}
  const displayTitle = title || defaultTitles[feature] || 'Feature Locked'
  const displayDescription = description || defaultDescriptions[feature] || 'This feature is not available in your current plan'

  if (style === 'inline') {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🔒</div>
        <p style={{ fontSize: '.85rem', color: 'var(--text)', marginBottom: 12 }}>{displayDescription}</p>
        <Link to={`/register?plan=${plan?.toLowerCase()}`} style={{ color: 'var(--green)', fontSize: '.82rem', textDecoration: 'none', fontWeight: 600 }}>
          Upgrade to {plan} →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.25)', borderRadius: 10, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <span style={{ fontSize: '1.3rem' }}>🔒</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 4 }}>{displayTitle}</div>
          <p style={{ fontSize: '.85rem', color: 'var(--text)', marginBottom: 12 }}>{displayDescription}</p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to={`/register?plan=${plan?.toLowerCase()}`} className="btn-primary" style={{ padding: '8px 20px', fontSize: '.85rem' }}>
              Upgrade to {plan} — {price}
            </Link>
            <Link to="/#pricing" style={{ fontSize: '.82rem', color: 'var(--green)', textDecoration: 'none' }}>
              Compare plans →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
