import { useSubscription } from '../../hooks/useSubscription'

const planColors = {
  starter: { bg: 'rgba(59,130,246,.15)', color: '#60a5fa', border: 'rgba(59,130,246,.3)' },
  growth:  { bg: 'var(--green-dim)',     color: 'var(--green)', border: 'rgba(0,255,136,.3)' },
  business:{ bg: 'rgba(139,92,246,.15)', color: '#a78bfa', border: 'rgba(139,92,246,.3)' },
  enterprise:{ bg: 'rgba(250,204,21,.15)', color: '#facc15', border: 'rgba(250,204,21,.3)' },
}

export default function PlanBadge({ showTrial = true }) {
  const { currentPlan, isTrial, trialEnds } = useSubscription()
  const c = planColors[currentPlan] || planColors.starter

  const daysLeft = trialEnds
    ? Math.ceil((new Date(trialEnds) - new Date()) / 86400000)
    : 0

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '3px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700 }}>
        {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
      </span>
      {showTrial && isTrial && (
        <span style={{ background: 'rgba(251,146,60,.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,.3)', padding: '3px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600 }}>
          Trial{daysLeft > 0 ? ` · ${daysLeft}d left` : ' · Expired'}
        </span>
      )}
    </div>
  )
}
