import { DashboardContent } from './DashboardContent'
import { useDashboard } from './useDashboard'
import './dashboard.css'

export function Dashboard() {
  const dashboard = useDashboard()

  if (dashboard.status !== 'ready') {
    if (dashboard.status === 'loading') return <DashboardSkeleton />

    return (
      <div className="dashboard-message panel">
        <p role="alert">We couldn't load your dashboard.</p>
        <button type="button" onClick={() => { void dashboard.retry() }} disabled={dashboard.isFetching}>Retry</button>
      </div>
    )
  }

  return (
    <>
      {dashboard.hasRefreshError ? (
        <div className="dashboard-message refresh-warning">
          <p role="alert">We couldn't refresh your dashboard. Showing previously loaded data.</p>
          <button type="button" onClick={() => { void dashboard.retry() }} disabled={dashboard.isFetching}>Retry</button>
        </div>
      ) : null}
      <DashboardContent customer={dashboard.customer} accounts={dashboard.accounts} transactions={dashboard.transactions} />
    </>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <p className="sr-only" role="status">Loading your dashboard</p>
      <div className="dashboard-layout" aria-hidden="true">
        <div className="dashboard-column">
          <div className="skeleton skeleton-heading" />
          <div className="balance-hero skeleton-panel">
            <div className="skeleton skeleton-line" /><div className="skeleton skeleton-value" /><div className="skeleton skeleton-line" />
          </div>
          <div className="skeleton skeleton-heading" />
          <div className="account-grid">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="panel account-card" key={index}>
                <div className="skeleton skeleton-line" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-value" /><div className="skeleton skeleton-line" />
              </div>
            ))}
          </div>
          <div className="panel transactions-panel">
            <div className="skeleton skeleton-heading" />
            {Array.from({ length: 8 }, (_, index) => (
              <div className="transaction-row" key={index}>
                <div className="transaction-details"><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line" /></div>
                <div className="skeleton skeleton-line" />
              </div>
            ))}
          </div>
        </div>
        <div className="panel daily-limit"><div className="skeleton skeleton-line" /><div className="skeleton skeleton-value" /><div className="skeleton skeleton-line" /></div>
      </div>
    </>
  )
}
