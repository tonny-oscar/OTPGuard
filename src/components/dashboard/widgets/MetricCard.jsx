import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  subtitle,
  progressBar,
  badge,
  color = 'blue',
  size = 'normal'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600'
  };
  
  const iconBgClass = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${size === 'large' ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trendUp !== undefined && (
                trendUp ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )
              )}
              <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : trendUp === false ? 'text-red-600' : 'text-gray-600'}`}>
                {trend}
              </span>
            </div>
          )}
          
          {progressBar !== undefined && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${progressBar > 80 ? 'bg-red-500' : progressBar > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(progressBar, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`flex-shrink-0 p-3 rounded-lg ${iconBgClass}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
