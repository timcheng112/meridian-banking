import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateTransferRequest } from '../../api/types'
import { createTransfer } from './transferSubmission'

type RefreshStatus = 'idle' | 'refreshing' | 'ready' | 'error'
export function useTransferSubmission() {
  const client = useQueryClient()
  const mutation = useMutation({ mutationFn: createTransfer, retry: false })
  // This lock covers validation before React can render the pending mutation.
  const lock = useRef<'idle' | 'validating' | 'pending' | 'success'>('idle')
  const [validating, setValidating] = useState(false)
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>('idle')
  const refreshAttempt = useRef(0)

  async function refresh() {
    const attempt = ++refreshAttempt.current
    setRefreshStatus('refreshing')
    const results = await Promise.allSettled(['customer', 'accounts', 'transactions'].map(async (family) => {
      const queryKey = [family]
      // Explicit cancellation also replaces initial search reads with no cached data.
      await client.cancelQueries({ queryKey })
      await client.invalidateQueries({ queryKey }, { throwOnError: true, cancelRefetch: true })
    }))
    if (attempt === refreshAttempt.current) {
      setRefreshStatus(results.some((result) => result.status === 'rejected') ? 'error' : 'ready')
    }
  }
  function begin() {
    if (lock.current !== 'idle') return false
    lock.current = 'validating'
    mutation.reset()
    setValidating(true)
    return true
  }
  function invalid() {
    lock.current = 'idle'
    setValidating(false)
  }
  async function submit(request: CreateTransferRequest) {
    if (lock.current !== 'validating') return
    lock.current = 'pending'
    // The form calls this exactly once after acquiring the validation lock.
    setValidating(false)
    try {
      await mutation.mutateAsync(request)
      lock.current = 'success'
      void refresh()
    } catch (error) {
      lock.current = 'idle'
      throw error
    }
  }
  function reset() {
    lock.current = 'idle'
    setValidating(false)
    mutation.reset()
    // Acknowledging a receipt never cancels its dashboard refresh.
  }
  const phase = validating ? 'validating' : mutation.status
  return {
    phase,
    receipt: mutation.data?.transfer,
    error: mutation.error,
    refreshStatus,
    begin,
    invalid,
    submit,
    reset,
    refresh,
    isLocked: () => lock.current !== 'idle',
  }
}
export type TransferSubmission = ReturnType<typeof useTransferSubmission>
