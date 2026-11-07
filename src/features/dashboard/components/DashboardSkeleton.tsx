import { Skeleton } from '../../../components/ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <>
      <p className="sr-only" role="status">Loading your dashboard</p>
      <div className="dashboard-layout" aria-hidden="true">
        <div className="dashboard-column">
          <Skeleton kind="heading" />
          <div className="balance-hero skeleton-panel">
            <Skeleton kind="line" /><Skeleton kind="value" /><Skeleton kind="line" />
          </div>
          <Skeleton kind="heading" />
          <div className="account-grid">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="panel account-card" key={index}>
                <Skeleton kind="line" /><Skeleton kind="line" /><Skeleton kind="value" /><Skeleton kind="line" />
              </div>
            ))}
          </div>
          <div className="panel transactions-panel">
            <Skeleton kind="heading" />
            {Array.from({ length: 8 }, (_, index) => (
              <div className="transaction-row" key={index}>
                <div className="transaction-details"><Skeleton kind="line" /><Skeleton kind="line" /></div>
                <Skeleton kind="line" />
              </div>
            ))}
          </div>
        </div>
        <div className="panel daily-limit"><Skeleton kind="line" /><Skeleton kind="value" /><Skeleton kind="line" /></div>
      </div>
    </>
  )
}
