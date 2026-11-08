import type { ReactNode } from 'react'
import { ApiError } from '../../api/client'
import { useTransferLauncher } from './useTransferLauncher'
import { useTransferSubmission } from '../transfer/useTransferSubmission'
import { TransferDialog } from '../transfer/TransferDialog'
import { DashboardContent } from './DashboardContent'
import { DashboardFeedback } from './components/DashboardFeedback'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { useDashboard } from './useDashboard'
import './dashboard.css'

export function Dashboard({ mobilePreferences }: { mobilePreferences: ReactNode }) {
  const transfer = useTransferLauncher()
  const submission = useTransferSubmission()
  const dashboard = useDashboard()
  function closeTransfer() {
    const retain = submission.isLocked() && !submission.receipt
    transfer.close(retain)
    if (!retain) submission.reset()
  }
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

  let transferStatus = 'Sending transfer… Open New transfer to view its status.'
  if (submission.phase === 'success') {
    transferStatus = 'Transfer sent. Open New transfer to view the confirmation.'
  } else if (submission.phase === 'error') {
    transferStatus = submission.error instanceof ApiError
      ? 'Transfer failed. Open New transfer to review and try again.'
      : "We couldn't confirm whether this transfer completed. Open New transfer to review its status."
  }

  return (
    <>
      {hasRefreshError ? (
        <DashboardFeedback kind="refresh-error" onRetry={retry} isFetching={isFetching} />
      ) : null}
      <DashboardContent
        onNewTransfer={transfer.open}
        mobilePreferences={mobilePreferences}
        customer={customer}
        accounts={accounts}
        transactions={transactions}
      />
      {!transfer.isOpen && transfer.hasSession ? (
        <p role={submission.phase === 'error' ? 'alert' : 'status'}>{transferStatus}</p>
      ) : null}
      {transfer.hasSession ? <TransferDialog
        customer={customer}
        accounts={accounts}
        visible={transfer.isOpen}
        submission={submission}
        onClose={closeTransfer}
        onInvalid={transfer.discardHidden}
      /> : null}
    </>
  )
}
