import type { ReactNode } from 'react'
import { useTransferLauncher } from './useTransferLauncher'
import { TransferDialog } from '../transfer/TransferDialog'
import { DashboardContent } from './DashboardContent'
import { DashboardFeedback } from './components/DashboardFeedback'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { useDashboard } from './useDashboard'
import './dashboard.css'

export function Dashboard({ mobilePreferences }: { mobilePreferences: ReactNode }) {
  const transfer = useTransferLauncher()
  const dashboard = useDashboard()
  const { status, retry, isFetching } = dashboard

  if (status !== 'ready') {
    if (status === 'loading') return <DashboardSkeleton mobilePreferences={mobilePreferences} />

    return (
      <>
        <div className="mobile-preferences">{mobilePreferences}</div>
        <DashboardFeedback kind="initial-error" onRetry={retry} isFetching={isFetching} />
      </>
    )
  }

  const { hasRefreshError, customer, accounts, transactions } = dashboard

  return (
    <>
      {hasRefreshError ? (
        <DashboardFeedback kind="refresh-error" onRetry={retry} isFetching={isFetching} />
      ) : null}
      <DashboardContent onNewTransfer={transfer.open} mobilePreferences={mobilePreferences} customer={customer} accounts={accounts} transactions={transactions} />
      {transfer.isOpen ? <TransferDialog customer={customer} accounts={accounts} onClose={transfer.close} /> : null}
    </>
  )
}
