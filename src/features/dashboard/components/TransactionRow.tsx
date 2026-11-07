import type { Transaction } from '../../../api/types'
import { formatMoney, formatShortDate } from '../../../lib/format'

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const incoming = transaction.direction === 'in'
  return (
    <li className="transaction-row">
      <div className="transaction-details">
        <h3>{transaction.description}</h3>
        <div className="transaction-metadata">
          <p><span className="transaction-category">{transaction.category}</span> · <time dateTime={transaction.date}>{formatShortDate(transaction.date)}</time></p>
          {transaction.status === 'pending' ? <span className="pending-chip">Pending</span> : null}
        </div>
      </div>
      <p className={`transaction-amount amount${incoming ? ' money-in' : ''}`}>
        {incoming ? `+${formatMoney(transaction.amount)}` : formatMoney(-transaction.amount)}
      </p>
    </li>
  )
}
