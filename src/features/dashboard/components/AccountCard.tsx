import type { Account } from '../../../api/types'
import { formatMoney } from '../../../lib/format'

export function AccountCard({ account }: { account: Account }) {
  const { id, name, maskedNumber, balance, type } = account

  return (
    <article className="panel account-card" aria-labelledby={`account-${id}`}>
      <div className="account-identity">
        <h3 id={`account-${id}`}>{name}</h3>
        <p className="amount">{maskedNumber}</p>
      </div>
      <div className="account-value">
        <p className="account-balance amount">{formatMoney(balance)}</p>
        <p>{type === 'credit' ? 'Amount due' : 'Available balance'}</p>
      </div>
    </article>
  )
}
