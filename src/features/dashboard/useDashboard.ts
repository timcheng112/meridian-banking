import { useQuery } from '@tanstack/react-query'
import type { AccountsResponse, CustomerResponse, TransactionsResponse } from '../../api/types'
import { accountsQuery, customerQuery, recentTransactionsQuery } from './queries'

type DashboardState = {
  retry: () => Promise<void>
  isFetching: boolean
} & (
  | { status: 'loading' | 'error' }
  | {
      status: 'ready'
      customer: CustomerResponse['customer']
      accounts: AccountsResponse['accounts']
      transactions: TransactionsResponse['transactions']
      transactionCount: number
      hasRefreshError: boolean
    }
)

export function useDashboard(): DashboardState {
  const customer = useQuery(customerQuery)
  const accounts = useQuery(accountsQuery)
  const transactions = useQuery(recentTransactionsQuery)

  const isFetching = customer.isFetching || accounts.isFetching || transactions.isFetching
  const hasError = customer.isError || accounts.isError || transactions.isError
  async function retry() {
    await Promise.all([
      customer.refetch({ cancelRefetch: false }),
      accounts.refetch({ cancelRefetch: false }),
      transactions.refetch({ cancelRefetch: false }),
    ])
  }

  // A failed refresh still has usable cached data; initial failures do not.
  if (customer.data && accounts.data && transactions.data) {
    return {
      status: 'ready',
      customer: customer.data.customer,
      accounts: accounts.data.accounts,
      transactions: transactions.data.transactions,
      transactionCount: transactions.data.total,
      hasRefreshError: hasError,
      isFetching,
      retry,
    }
  }

  return { status: hasError ? 'error' : 'loading', isFetching, retry }
}
