import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { server } from '../../test/setup'
import { useDashboard } from './useDashboard'

const endpoints = ['customer', 'accounts', 'transactions'] as const
const clients: QueryClient[] = []

function setup() {
  // Deliberately allow retries globally: dashboard queries must opt out themselves.
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 1, retryDelay: 0, staleTime: 30_000 } },
  })
  clients.push(client)
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { ...renderHook(useDashboard, { wrapper: Wrapper }), client }
}

afterEach(() => {
  cleanup()
  clients.forEach((client) => client.clear())
  clients.length = 0
})

describe('dashboard data', () => {
  it('starts all reads before any response and waits for the slowest resource', async () => {
    const started = new Set<string>()
    let transactionLimit: string | null = null
    let release: () => void = () => undefined
    const gate = new Promise<void>((resolve) => { release = resolve })
    let releaseTransactions: () => void = () => undefined
    const transactionGate = new Promise<void>((resolve) => { releaseTransactions = resolve })
    server.use(...endpoints.map((endpoint) => http.get(`*/api/${endpoint}`, async ({ request }) => {
      started.add(endpoint)
      await gate
      if (endpoint === 'transactions') {
        transactionLimit = new URL(request.url).searchParams.get('limit')
        await transactionGate
        return HttpResponse.json({ transactions: [], total: 0 })
      }
      if (endpoint === 'accounts') return HttpResponse.json({ accounts: [] })
      return HttpResponse.json({ customer: {
        id: 'customer', firstName: 'Ava', lastName: 'Chen', email: 'ava@example.com',
        segment: 'retail', dailyTransferLimit: 5000, transferredToday: 0,
      } })
    })))

    const { result, client } = setup()
    try {
      await waitFor(() => expect(started.size).toBe(3))
      expect(result.current.status).toBe('loading')
      release()
      await waitFor(() => expect(client.isFetching()).toBe(1))
      expect(transactionLimit).toBe('8')
      expect(result.current.status).toBe('loading')
    } finally {
      release()
      releaseTransactions()
    }
    await waitFor(() => expect(result.current.status).toBe('ready'))
    if (result.current.status !== 'ready') throw new Error('Expected dashboard data')
    expect(result.current.accounts).toEqual([])
    expect(result.current.transactions).toEqual([])
    expect(result.current.transactionCount).toBe(0)
  })

  it('loads the supplied customer, accounts and eight newest transactions', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    if (result.current.status !== 'ready') throw new Error('Expected dashboard data')
    expect(result.current.customer.firstName).toBe('Ava')
    expect(result.current.accounts).toHaveLength(3)
    expect(result.current.transactions).toHaveLength(8)
    expect(result.current.transactionCount).toBe(15)
    expect(result.current.transactions[0]?.description).toBe('FairPrice Finest')
    const dates = result.current.transactions.map((transaction) => Date.parse(transaction.date))
    expect(dates).toEqual([...dates].sort((a, b) => b - a))
  })

  it.each(endpoints)('exposes a %s failure without automatic retries, then retries all reads', async (failedEndpoint) => {
    let attempts = 0
    const requests = new Map<string, number>()
    server.use(http.get(`*/api/${failedEndpoint}`, () => {
      attempts += 1
      return HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Down' } }, { status: 500 })
    }))
    const { result, client } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
    await waitFor(() => expect(client.isFetching()).toBe(0))
    expect(attempts).toBe(1)

    server.resetHandlers()
    const countRequest = ({ request }: { request: Request }) => {
      const path = new URL(request.url).pathname
      requests.set(path, (requests.get(path) ?? 0) + 1)
    }
    server.events.on('request:start', countRequest)
    try {
      await act(async () => { await result.current.retry() })
      await waitFor(() => expect(result.current.status).toBe('ready'))
      for (const endpoint of endpoints) expect(requests.get(`/api/${endpoint}`)).toBe(1)
    } finally {
      server.events.removeListener('request:start', countRequest)
    }
  })

  it('keeps cached data during refresh failure and clears the error after recovery', async () => {
    const { result, client } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    if (result.current.status !== 'ready') throw new Error('Expected dashboard data')
    const previousAccounts = result.current.accounts
    server.use(http.get('*/api/accounts', () =>
      HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Down' } }, { status: 500 }),
    ))

    await act(async () => { await client.invalidateQueries() })
    await waitFor(() => {
      expect(result.current.status).toBe('ready')
      if (result.current.status === 'ready') expect(result.current.hasRefreshError).toBe(true)
    })
    if (result.current.status !== 'ready') throw new Error('Expected cached dashboard')
    expect(result.current.accounts).toEqual(previousAccounts)

    server.resetHandlers()
    await act(async () => { await result.current.retry() })
    await waitFor(() => {
      if (result.current.status !== 'ready') throw new Error('Expected dashboard data')
      expect(result.current.hasRefreshError).toBe(false)
    })
  })
})


describe('invalid dashboard responses', () => {
  it.each(['<html>Vite</html>', '{broken', 'null'])('shows an initial error for %s', async (body) => {
    server.use(http.get('*/api/accounts', () => new HttpResponse(body)))
    const { result, client } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(client.getQueryData(['accounts'])).toBeUndefined()
  })

  it.each(['<html>Vite</html>', '{broken', 'null'])('preserves cached data after refresh returns %s', async (body) => {
    const { result, client } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    const cached = client.getQueryData(['accounts'])
    server.use(http.get('*/api/accounts', () => new HttpResponse(body)))
    await act(async () => { await client.invalidateQueries() })
    expect(result.current.status).toBe('ready')
    if (result.current.status !== 'ready') throw new Error('Expected cache')
    expect(result.current.hasRefreshError).toBe(true)
    expect(client.getQueryData(['accounts'])).toBe(cached)
  })

  it('retries all reads after an invalid response is removed', async () => {
    server.use(http.get('*/api/accounts', () => new HttpResponse('null')))
    const { result, client } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
    await waitFor(() => expect(client.isFetching()).toBe(0))
    server.resetHandlers()
    await act(async () => { await result.current.retry() })
    await waitFor(() => expect(result.current.status).toBe('ready'))
  })
})
