import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import type { AccountsResponse, CustomerResponse, TransactionsResponse } from '../../api/types'

export const customerQuery = queryOptions({
  queryKey: ['customer'],
  queryFn: ({ signal }) => apiFetch<CustomerResponse>('/api/customer', { signal }),
  retry: false,
})

export const accountsQuery = queryOptions({
  queryKey: ['accounts'],
  queryFn: ({ signal }) => apiFetch<AccountsResponse>('/api/accounts', { signal }),
  retry: false,
})

export const recentTransactionsQuery = queryOptions({
  queryKey: ['transactions', { limit: 8 }],
  queryFn: ({ signal }) => apiFetch<TransactionsResponse>('/api/transactions?limit=8', { signal }),
  retry: false,
})
