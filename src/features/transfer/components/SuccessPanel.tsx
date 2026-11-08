import type { Transfer } from '../../../api/types'
import { Button } from '../../../components/ui/Button'
import { formatMoney } from '../../../lib/format'
import type { TransferSubmission } from '../useTransferSubmission'

export function SuccessPanel({ receipt, refreshStatus, onRetry }: {
  receipt: Transfer
  refreshStatus: TransferSubmission['refreshStatus']
  onRetry: () => void
}) {
  return <section className="transfer-success">
    <span className="success-medallion" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-8" /></svg>
    </span>
    <h3 tabIndex={-1}>Transfer sent</h3>
    <p className="success-amount">{formatMoney(receipt.amount)}</p>
    <p>to {receipt.recipient.name}<br />{receipt.recipient.bank} · {receipt.recipient.accountNumberMasked}</p>
    <p className="success-reference">Reference {receipt.reference}</p>
    <p>The money should arrive within minutes.</p>
    {refreshStatus === 'refreshing' ? <p role="status">Transfer sent. Updating your dashboard…</p> : null}
    {refreshStatus === 'error' ? <div className="transfer-feedback" role="status">
      <p>Transfer sent, but we couldn't refresh your dashboard. Your transfer is complete. Try refreshing the dashboard.</p>
      <Button type="button" variant="secondary" onClick={onRetry}>Retry dashboard refresh</Button>
    </div> : null}
  </section>
}
