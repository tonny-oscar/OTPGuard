import { useSubscription } from '../hooks/useSubscription';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StarterDashboard from '../components/plans/StarterDashboard';
import GrowthDashboard from '../components/plans/GrowthDashboard';
import BusinessDashboard from '../components/plans/BusinessDashboard';
import EnterpriseDashboard from '../components/plans/EnterpriseDashboard';

export default function PlanBasedDashboard() {
  const { currentPlan, loading } = useSubscription();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  const dashboards = {
    starter: StarterDashboard,
    growth: GrowthDashboard,
    business: BusinessDashboard,
    enterprise: EnterpriseDashboard
  };
  
  const DashboardComponent = dashboards[currentPlan] || StarterDashboard;
  
  return (
    <DashboardLayout>
      <DashboardComponent />
    </DashboardLayout>
  );
}
