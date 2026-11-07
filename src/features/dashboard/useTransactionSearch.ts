import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { transactionSearchQuery } from './queries'

export function useTransactionSearch() {
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
  const clear = () => { setRawInput(''); setSettledTerm('') }
  return { input, setInput, active, data, pending, error, fetching: settled && query.isFetching, clear, retry: () => { void query.refetch() } }
}
