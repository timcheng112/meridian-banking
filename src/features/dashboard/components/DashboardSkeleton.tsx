import type { ReactNode } from 'react'
import { Skeleton } from '../../../components/ui/Skeleton'
import { NewTransferButton } from './NewTransferButton'

export function DashboardSkeleton({ mobilePreferences }: { mobilePreferences: ReactNode }) {
  return (
    <>
      <p className="sr-only" role="status">Loading your dashboard</p>
      <div className="dashboard-layout dashboard-skeleton">
        <div className="dashboard-column">
          <div className="dashboard-greeting">
            <Skeleton kind="heading" className="skeleton-greeting" />
            <div className="mobile-preferences">{mobilePreferences}</div>
          </div>
          <div className="balance-hero" aria-hidden="true">
            <div className="balance-details skeleton-balance-details">
              <Skeleton kind="line" />
              <Skeleton kind="value" className="skeleton-hero-value" />
              <Skeleton kind="line" />
            </div>
            <div className="desktop-transfer"><NewTransferButton /></div>
          </div>
          <div className="accounts-section" aria-hidden="true">
            <Skeleton kind="heading" className="skeleton-section-heading" />
            <div className="account-grid">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="panel account-card" key={index}>
                  <div className="account-identity"><Skeleton kind="line" className="skeleton-account-title" /><Skeleton kind="line" /></div>
                  <div className="account-value"><Skeleton kind="value" className="skeleton-account-value" /><Skeleton kind="line" /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel transactions-panel" aria-hidden="true">
            <div className="transactions-heading"><Skeleton kind="heading" className="skeleton-section-heading" /><Skeleton kind="line" className="skeleton-search" /></div>
            {Array.from({ length: 8 }, (_, index) => (
              <div className="transaction-row" key={index}>
                <span className="merchant-mark"><Skeleton kind="line" /></span>
                <div className="transaction-details"><Skeleton kind="line" className="skeleton-transaction-title" /><Skeleton kind="line" className="skeleton-transaction-meta" /></div>
                <Skeleton kind="line" className="skeleton-transaction-amount" />
              </div>
            ))}
          </div>
        </div>
        <div className="panel daily-limit" aria-hidden="true">
          <Skeleton kind="line" /><Skeleton kind="value" className="skeleton-limit-value" /><Skeleton kind="line" />
          <div className="skeleton-limit-note"><Skeleton kind="line" /><Skeleton kind="line" /></div>
        </div>
      </div>
      <div className="mobile-transfer"><NewTransferButton /></div>
    </>
  )
}
