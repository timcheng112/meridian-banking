import type { ReactNode } from 'react'
import type { Account, Customer, Transaction } from '../../api/types'
import { NewTransferButton } from './components/NewTransferButton'
import { AccountCard } from './components/AccountCard'
import { BalanceHero } from './components/BalanceHero'
import { DailyLimitCard } from './components/DailyLimitCard'
import { TransactionList } from './components/TransactionList'

type DashboardContentProps = {
  mobilePreferences: ReactNode
  customer: Customer
  accounts: Account[]
  transactions: Transaction[]
}

export function DashboardContent({ customer, accounts, transactions, mobilePreferences }: DashboardContentProps) {
  const deposits = accounts.filter((account) => account.type !== 'credit')
  const total = deposits.reduce((sum, account) => sum + account.balance, 0)
  const remaining = customer.dailyTransferLimit - customer.transferredToday

  return (
    <>
      <div className="dashboard-layout">
        <div className="dashboard-column">
          <div className="dashboard-greeting">
            <h1>Good evening, {customer.firstName}</h1>
            <div className="mobile-preferences">{mobilePreferences}</div>
          </div>
          <BalanceHero total={total} depositCount={deposits.length} />
          <section className="accounts-section" aria-labelledby="accounts-heading">
            <h2 id="accounts-heading">Accounts</h2>
            {accounts.length === 0 ? <p className="panel">No accounts to display.</p> : (
              <div className="account-grid">{accounts.map((account) => <AccountCard key={account.id} account={account} />)}</div>
            )}
          </section>
          <TransactionList transactions={transactions} />
        </div>
        <DailyLimitCard remaining={remaining} />
      </div>
      <div className="mobile-transfer"><NewTransferButton /></div>
    </>
  )
}
