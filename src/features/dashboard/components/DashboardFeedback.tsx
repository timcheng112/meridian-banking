import { Button } from '../../../components/ui/Button'

type DashboardFeedbackProps = {
  kind: 'initial-error' | 'refresh-error'
  isFetching: boolean
  onRetry: () => Promise<void>
}

export function DashboardFeedback({ kind, isFetching, onRetry }: DashboardFeedbackProps) {
  const isInitialError = kind === 'initial-error'

  return (
    <div className={`dashboard-message ${isInitialError ? 'panel' : 'refresh-warning'}`}>
      <p role="alert">{isInitialError
        ? "We couldn't load your dashboard."
        : "We couldn't refresh your dashboard. Showing previously loaded data."}</p>
      <Button type="button" onClick={() => { void onRetry() }} disabled={isFetching}>Retry</Button>
    </div>
  )
}
