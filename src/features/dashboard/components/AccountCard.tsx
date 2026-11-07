import type { Account } from '../../../api/types'
import { formatMoney } from '../../../lib/format'

export function AccountCard({ account }: { account: Account }) {
  return (
    <article className="panel account-card" aria-labelledby={`account-${account.id}`}>
      <div className="account-identity">
        <h3 id={`account-${account.id}`}>{account.name}</h3>
        <p className="amount">{account.maskedNumber}</p>
      </div>
      <div className="account-value">
        <p className="account-balance amount">{formatMoney(account.balance)}</p>
        <p>{account.type === 'credit' ? 'Amount due' : 'Available balance'}</p>
      </div>
    </article>
  )
}
