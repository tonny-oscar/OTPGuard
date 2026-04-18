import { useSubscription } from '../../hooks/useSubscription';
import { PLAN_COLORS } from '../../utils/planPermissions';

export default function PlanBadge({ showTrial = true, className = '' }) {
  const { currentPlan, isTrial, trialEnds } = useSubscription();
  
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };
  
  const planColor = PLAN_COLORS[currentPlan] || 'blue';
  const colorClass = colorClasses[planColor];
  
  const formatTrialEnd = (date) => {
    if (!date) return '';
    const daysLeft = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `${daysLeft} days left` : 'Expired';
  };
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
        {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
      </span>
      {showTrial && isTrial && (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          Trial • {formatTrialEnd(trialEnds)}
        </span>
      )}
    </div>
  );
}
