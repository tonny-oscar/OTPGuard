import { useSubscription } from '../hooks/useSubscription'
import DashboardLayout from '../Components/dashboard/DashboardLayout'
import StarterDashboard from '../Components/plans/StarterDashboard'
import GrowthDashboard from '../Components/plans/GrowthDashboard'
import BusinessDashboard from '../Components/plans/BusinessDashboard'
import EnterpriseDashboard from '../Components/plans/EnterpriseDashboard'

const dashboards = {
  starter:    StarterDashboard,
  growth:     GrowthDashboard,
  business:   BusinessDashboard,
  enterprise: EnterpriseDashboard,
}

export default function PlanBasedDashboard() {
  const { currentPlan, loading } = useSubscription()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--green)', fontSize: '1.1rem' }}>Loading dashboard…</div>
      </div>
    )
  }

  const DashboardComponent = dashboards[currentPlan] || StarterDashboard

  return (
    <DashboardLayout>
      <DashboardComponent />
    </DashboardLayout>
  )
}
