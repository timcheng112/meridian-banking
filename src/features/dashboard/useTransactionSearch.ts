import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Transaction } from '../../api/types'
import { transactionSearchQuery } from './queries'

export function useTransactionSearch(recentTransactions: Transaction[]) {
  const [input, setRawInput] = useState('')
  const [settledTerm, setSettledTerm] = useState('')
  const term = input.trim()
  useEffect(() => {
    const timer = window.setTimeout(() => setSettledTerm(term), 300)
    return () => window.clearTimeout(timer)
  }, [term])
  const active = term.length > 0
  const settled = active && term === settledTerm
  const query = useQuery({ ...transactionSearchQuery(term), enabled: settled })
  // A disabled observer can still expose cached data; only a settled exact term is displayed.
  const data = settled ? query.data : undefined
  const pending = active && (!settled || (!data && !query.isError))
  const error = settled && (query.isError || (query.isFetching && query.errorUpdatedAt > query.dataUpdatedAt))
  const setInput = (next: string) => {
    setRawInput(next)
    if (next.trim() !== term) setSettledTerm('')
  }
  const clear = () => {
    setRawInput('')
    setSettledTerm('')
  }
  const fetching = settled && query.isFetching
  const rows = active ? data?.transactions ?? [] : recentTransactions
  const count = data?.total
  const status = pending ? 'Searching transactions…'
    : count !== undefined ? `${count} ${count === 1 ? 'result' : 'results'}${count > 8 ? ' · Showing 8' : ''}${fetching ? ' · Updating results…' : ''}` : ''
  const errorMessage = error
    ? data ? "We couldn't refresh your search results. Showing previously loaded results." : "We couldn't search your transactions."
    : undefined
  const emptyMessage = !error || data
    ? active ? 'No transactions match your search.' : 'No recent transactions.'
    : undefined

  return {
    input,
    setInput,
    rows,
    pending,
    status,
    errorMessage,
    emptyMessage,
    fetching,
    clear,
    retry: () => { void query.refetch() },
  }
}
