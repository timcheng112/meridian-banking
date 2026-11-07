import type { Account, Customer, Transaction } from '../../api/types'
import { formatMoney, formatShortDate } from '../../lib/format'

type DashboardContentProps = {
  customer: Customer
  accounts: Account[]
  transactions: Transaction[]
}

export function DashboardContent({ customer, accounts, transactions }: DashboardContentProps) {
  const deposits = accounts.filter((account) => account.type !== 'credit')
  const total = deposits.reduce((sum, account) => sum + account.balance, 0)
  const remaining = customer.dailyTransferLimit - customer.transferredToday

  return (
    <div className="dashboard-layout">
      <div className="dashboard-column">
        <h1>Good evening, {customer.firstName}</h1>
        <section className="balance-hero" aria-labelledby="total-heading">
          <div className="balance-details">
            <h2 id="total-heading">Total available</h2>
            <p className="total-value amount">{formatMoney(total)}</p>
            <p>Across {deposits.length} deposit {deposits.length === 1 ? 'account' : 'accounts'}</p>
          </div>
          <button type="button" className="transfer-button" disabled>New transfer</button>
        </section>
        <section className="accounts-section" aria-labelledby="accounts-heading">
          <h2 id="accounts-heading">Accounts</h2>
          {accounts.length === 0 ? <p className="panel">No accounts to display.</p> : (
            <div className="account-grid">{accounts.map((account) => <AccountCard key={account.id} account={account} />)}</div>
          )}
        </section>
        <section className="panel transactions-panel" aria-labelledby="transactions-heading">
          <div className="transactions-heading">
            <h2 id="transactions-heading">Recent transactions</h2>
            <input type="search" aria-label="Search transactions" placeholder="Search transactions" disabled />
          </div>
          {transactions.length === 0 ? <p className="empty-copy">No recent transactions.</p> : (
            <ul className="transaction-list" aria-label="Recent transactions">
              {transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}
            </ul>
          )}
        </section>
      </div>
      <section className="panel daily-limit" aria-labelledby="limit-heading">
        <h2 id="limit-heading">Daily transfer limit</h2>
        <p className="limit-value amount">{formatMoney(remaining)}</p>
        <p>remaining today</p>
        <p className="limit-note">Resets daily.<br />Applies to all transfers.</p>
      </section>
    </div>
  )
}

function AccountCard({ account }: { account: Account }) {
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

function TransactionRow({ transaction }: { transaction: Transaction }) {
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
