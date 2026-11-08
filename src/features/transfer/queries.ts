import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import type { PayeesResponse } from '../../api/types'

export const payeesQuery = queryOptions({
  queryKey: ['payees'],
  queryFn: ({ signal }) => apiFetch<PayeesResponse>('/api/payees', { signal }),
  retry: false,
})
