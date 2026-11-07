import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { TransferDialog } from '../transfer/TransferDialog'
import { DashboardContent } from './DashboardContent'
import { DashboardFeedback } from './components/DashboardFeedback'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { useDashboard } from './useDashboard'
import './dashboard.css'

export function Dashboard({ mobilePreferences }: { mobilePreferences: ReactNode }) {
  const [transferOpen, setTransferOpen] = useState(false)
  const opener = useRef<HTMLButtonElement | null>(null)
  function openTransfer(event: MouseEvent<HTMLButtonElement>) {
    opener.current = event.currentTarget
    setTransferOpen(true)
  }
  function closeTransfer() {
    setTransferOpen(false)
    requestAnimationFrame(() => {
      const isVisible = (element: HTMLElement) => element.getClientRects().length > 0
      const counterpart = Array.from(document.querySelectorAll<HTMLButtonElement>('.transfer-button')).find(isVisible)
      const target = opener.current && isVisible(opener.current) ? opener.current : counterpart
      if (target) target.focus()
      else {
        const heading = document.querySelector<HTMLElement>('.dashboard-greeting h1')
        if (heading) { heading.tabIndex = -1; heading.focus() }
      }
    })
  }
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
      <DashboardContent onNewTransfer={openTransfer} mobilePreferences={mobilePreferences} customer={customer} accounts={accounts} transactions={transactions} />
      {transferOpen ? <TransferDialog customer={customer} accounts={accounts} onClose={closeTransfer} /> : null}
    </>
  )
}
