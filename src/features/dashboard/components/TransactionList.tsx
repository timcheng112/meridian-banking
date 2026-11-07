import { useRef } from 'react'
import type { Transaction } from '../../../api/types'
import { Button } from '../../../components/ui/Button'
import { SearchInput } from '../../../components/ui/SearchInput'
import { Skeleton } from '../../../components/ui/Skeleton'
import { useTransactionSearch } from '../useTransactionSearch'
import { TransactionRow } from './TransactionRow'

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const search = useTransactionSearch()
  const inputRef = useRef<HTMLInputElement>(null)
  const rows = search.active ? search.data?.transactions ?? [] : transactions
  const count = search.data?.total
  const status = search.pending ? 'Searching transactions…'
    : count !== undefined ? `${count} ${count === 1 ? 'result' : 'results'}${count > 8 ? ' · Showing 8' : ''}${search.fetching ? ' · Updating results…' : ''}` : ''
  const clear = () => { search.clear(); inputRef.current?.focus() }
  return (
    <section className="panel transactions-panel" aria-labelledby="transactions-heading">
      <div className="transactions-heading">
        <h2 id="transactions-heading">Recent transactions</h2>
        <SearchInput ref={inputRef} aria-label="Search transactions" placeholder="Search transactions" value={search.input} onChange={event => search.setInput(event.target.value)} />
      </div>
      <div className="search-actions">
        <p role="status" aria-live="polite">{status}</p>
        {search.input ? <Button type="button" variant="secondary" onClick={clear}>Clear search</Button> : null}
      </div>
      {search.error ? (
        <div className="dashboard-message search-error" role="alert">
          <p>{search.data ? "We couldn't refresh your search results. Showing previously loaded results." : "We couldn't search your transactions."}</p>
          <Button type="button" variant="secondary" onClick={search.retry} disabled={search.fetching}>Retry</Button>
        </div>
      ) : null}
      <div aria-busy={search.pending} aria-label="Transaction results">
        {search.pending ? <div aria-hidden="true">{Array.from({ length: 8 }, (_, index) => (
          <div className="transaction-row" key={index}>
            <span className="merchant-mark"><Skeleton kind="line" /></span>
            <div className="transaction-details"><Skeleton kind="line" className="skeleton-transaction-title" /><Skeleton kind="line" className="skeleton-transaction-meta" /></div>
            <Skeleton kind="line" className="skeleton-transaction-amount" />
          </div>
        ))}</div> : rows.length ? (
          <ul className="transaction-list" aria-label="Recent transactions">
            {rows.map(transaction => <TransactionRow key={transaction.id} transaction={transaction} />)}
          </ul>
        ) : !search.error || search.data ? <p className="empty-copy">{search.active ? 'No transactions match your search.' : 'No recent transactions.'}</p> : null}
      </div>
    </section>
  )
}
