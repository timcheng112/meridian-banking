import type { Transaction } from '../../../api/types'
import { SearchInput } from '../../../components/ui/SearchInput'
import { TransactionRow } from './TransactionRow'

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <section className="panel transactions-panel" aria-labelledby="transactions-heading">
      <div className="transactions-heading">
        <h2 id="transactions-heading">Recent transactions</h2>
        <SearchInput aria-label="Search transactions" placeholder="Search transactions" disabled />
      </div>
      {transactions.length === 0 ? <p className="empty-copy">No recent transactions.</p> : (
        <ul className="transaction-list" aria-label="Recent transactions">
          {transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}
        </ul>
      )}
    </section>
  )
}
