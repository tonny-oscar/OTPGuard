import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import StarterDashboard    from '../Components/plans/StarterDashboard'
import GrowthDashboard     from '../Components/plans/GrowthDashboard'
import BusinessDashboard   from '../Components/plans/BusinessDashboard'
import EnterpriseDashboard from '../Components/plans/EnterpriseDashboard'

// Map plan name -> dashboard component
const DASHBOARDS = {
  starter:    StarterDashboard,
  growth:     GrowthDashboard,
  business:   BusinessDashboard,
  enterprise: EnterpriseDashboard,
}

// Plan display config
const PLAN_META = {
  starter:    { label: 'Starter',    color: '#60a5fa', bg: 'rgba(59,130,246,.1)',  border: 'rgba(59,130,246,.2)'  },
  growth:     { label: 'Growth',     color: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(0,255,136,.2)' },
  business:   { label: 'Business',   color: '#a78bfa', bg: 'rgba(139,92,246,.1)', border: 'rgba(139,92,246,.2)' },
  enterprise: { label: 'Enterprise', color: '#facc15', bg: 'rgba(250,204,21,.1)', border: 'rgba(250,204,21,.2)' },
}

function PlanBanner({ currentPlan, isTrial, trialEnds, planDetails }) {
  const meta = PLAN_META[currentPlan] || PLAN_META.starter
  const daysLeft = trialEnds
    ? Math.max(0, Math.ceil((new Date(trialEnds) - new Date()) / 86400000))
    : null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
      background: meta.bg, border: `1px solid ${meta.border}`,
      borderRadius: 10, padding: '12px 20px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
          borderRadius: 20, padding: '3px 12px', fontSize: '.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: .5,
        }}>{meta.label}</span>
        {isTrial && daysLeft !== null && (
          <span style={{ fontSize: '.8rem', color: '#fb923c', fontWeight: 600 }}>
            Trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
          </span>
        )}
        {planDetails && (
          <span style={{ fontSize: '.8rem', color: 'var(--text)' }}>
            {planDetails.max_users === -1 ? 'Unlimited users' : `Up to ${planDetails.max_users} users`}
            {' · '}
            {(planDetails.otp_channels || ['email']).join(', ').toUpperCase()} OTP
          </span>
        )}
      </div>
      {currentPlan !== 'enterprise' && (
        <Link to="/#pricing" style={{
          fontSize: '.8rem', fontWeight: 700, color: meta.color,
          textDecoration: 'none', padding: '5px 14px',
          border: `1px solid ${meta.border}`, borderRadius: 8,
          background: 'rgba(0,0,0,.2)', transition: 'opacity .2s',
        }}>
          Upgrade Plan
        </Link>
      )}
    </div>
  )
}

export default function PlanBasedDashboard() {
  const { user, logout } = useAuth()
  const { currentPlan, planDetails, isTrial, trialEnds, loading } = useSubscription()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(0,255,136,.15)', borderTopColor: 'var(--green)', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ color: 'var(--text)', fontSize: '.9rem' }}>Loading your dashboard...</span>
      </div>
    )
  }

  const DashboardComponent = DASHBOARDS[currentPlan] || StarterDashboard

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Topbar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem', color: 'var(--heading)', letterSpacing: '-.01em' }}>
            OTP<span style={{ color: 'var(--green)' }}>Guard</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Plan badge */}
            <span style={{
              fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: .5,
              background: PLAN_META[currentPlan]?.bg || 'var(--green-dim)',
              color: PLAN_META[currentPlan]?.color || 'var(--green)',
              border: `1px solid ${PLAN_META[currentPlan]?.border || 'rgba(0,255,136,.2)'}`,
              padding: '3px 10px', borderRadius: 20,
            }}>{currentPlan}</span>
            <span style={{ fontSize: '.85rem', color: 'var(--text)' }}>{user?.email}</span>
            <Link to="/dashboard/legacy" style={{ fontSize: '.8rem', color: 'var(--text)', textDecoration: 'none', padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6 }}>
              Classic View
            </Link>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {/* Plan banner */}
        <PlanBanner
          currentPlan={currentPlan}
          isTrial={isTrial}
          trialEnds={trialEnds}
          planDetails={planDetails}
        />

        {/* Plan-specific dashboard */}
        <DashboardComponent />
      </div>
    </div>
  )
}
