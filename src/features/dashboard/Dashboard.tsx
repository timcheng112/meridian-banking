import { DashboardContent } from './DashboardContent'
import { DashboardFeedback } from './components/DashboardFeedback'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { useDashboard } from './useDashboard'
import './dashboard.css'

export function Dashboard() {
  const dashboard = useDashboard()

  if (dashboard.status !== 'ready') {
    if (dashboard.status === 'loading') return <DashboardSkeleton />

    return <DashboardFeedback kind="initial-error" onRetry={dashboard.retry} isFetching={dashboard.isFetching} />
  }

  return (
    <>
      {dashboard.hasRefreshError ? (
        <DashboardFeedback kind="refresh-error" onRetry={dashboard.retry} isFetching={dashboard.isFetching} />
      ) : null}
      <DashboardContent customer={dashboard.customer} accounts={dashboard.accounts} transactions={dashboard.transactions} />
    </>
  )
}
