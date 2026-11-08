import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, expect, it, vi } from 'vitest'
import type { Transaction } from '../../api/types'
import { server } from '../../test/setup'
import { TransactionList } from './components/TransactionList'

const recent: Transaction = { id: 'recent', accountId: 'checking', description: 'Recent row', category: 'food', date: '2026-10-19', direction: 'out', amount: 1, status: 'posted' }
const clients: QueryClient[] = []
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  clients.push(client)
  render(<QueryClientProvider client={client}><TransactionList transactions={[recent]} /></QueryClientProvider>)
  return { client, input: screen.getByRole('searchbox') }
}
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.useRealTimers() })

it('debounces rapid edits, encodes the trimmed term, hides previous rows and immediately clears', async () => {
  vi.useFakeTimers()
  const requests: URL[] = []
  server.use(http.get('*/api/transactions', ({ request }) => { requests.push(new URL(request.url)); return HttpResponse.json({ transactions: [{ ...recent, id: 'match', description: 'Older match' }], total: 12 }) }))
  const { input } = setup()
  fireEvent.change(input, { target: { value: 'old' } })
  fireEvent.change(input, { target: { value: ' a&b ' } })
  expect(screen.queryByText('Recent row')).not.toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Searching transactions…')
  expect(document.querySelectorAll('.transaction-row')).toHaveLength(8)
  await act(async () => { await vi.advanceTimersByTimeAsync(299) })
  expect(requests).toHaveLength(0)
  await act(async () => { await vi.advanceTimersByTimeAsync(1) })
  await act(async () => { await vi.advanceTimersByTimeAsync(10) })
  vi.useRealTimers()
  expect(await screen.findByText('Older match')).toBeVisible()
  expect(requests).toHaveLength(1)
  expect(requests[0].searchParams.get('q')).toBe('a&b')
  expect(requests[0].searchParams.get('limit')).toBe('8')
  expect(screen.getByRole('status')).toHaveTextContent('12 results · Showing 8')
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  expect(screen.getByText('Recent row')).toBeVisible()
  expect(input).toHaveFocus()
  expect(input).toHaveValue('')
})

it('keeps errors local, retries the active query and preserves cached data on refresh failure', async () => {
  let fail = true
  server.use(http.get('*/api/transactions', async () => { await delay(60); return fail ? HttpResponse.json({ error: { code: 'DOWN', message: 'Down' } }, { status: 500 }) : HttpResponse.json({ transactions: [{ ...recent, description: 'Found row' }], total: 1 }) }))
  const { input, client } = setup()
  fireEvent.change(input, { target: { value: 'found' } })
  expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't search your transactions.")
  expect(input).toHaveValue('found')
  fail = false
  const retry = screen.getByRole('button', { name: 'Retry' })
  retry.focus()
  fireEvent.click(retry)
  expect(screen.getByRole('button', { name: 'Retry' })).toBe(retry)
  await waitFor(() => expect(retry).toBeDisabled())
  expect(retry).toHaveFocus()
  expect(await screen.findByText('Found row')).toBeVisible()
  expect(screen.getByRole('status')).toHaveTextContent('1 result')
  fail = true
  await act(async () => { await client.invalidateQueries({ queryKey: ['transactions'] }) })
  expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't refresh your search results. Showing previously loaded results.")
  expect(screen.getByText('Found row')).toBeVisible()
  fail = false
  const refreshRetry = screen.getByRole('button', { name: 'Retry' })
  refreshRetry.focus()
  fireEvent.click(refreshRetry)
  await waitFor(() => expect(refreshRetry).toBeDisabled())
  expect(refreshRetry).toHaveFocus()
  expect(screen.getByText('Found row')).toBeVisible()
  expect(screen.getByRole('status')).toHaveTextContent('Updating results…')
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
})

it('ignores a stale in-flight response after clear and distinguishes no matches', async () => {
  let resolve!: () => void
  server.use(http.get('*/api/transactions', async () => { await new Promise<void>(done => { resolve = done }); return HttpResponse.json({ transactions: [], total: 0 }) }))
  const { input } = setup()
  fireEvent.change(input, { target: { value: 'missing' } })
  await waitFor(() => expect(resolve).toBeTypeOf('function'))
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  await act(async () => { resolve() })
  expect(screen.getByText('Recent row')).toBeVisible()
  server.use(http.get('*/api/transactions', () => HttpResponse.json({ transactions: [], total: 0 })))
  fireEvent.change(input, { target: { value: 'none' } })
  expect(await screen.findByText('No transactions match your search.')).toBeVisible()
  expect(screen.getByRole('status')).toHaveTextContent('0 results')
})

it('searches mixed-case descriptions and categories beyond the recent eight through the API', async () => {
  const { input } = setup()
  fireEvent.change(input, { target: { value: 'nEtFlIx' } })
  expect(await screen.findByText('Netflix', {}, { timeout: 2000 })).toBeVisible()
  expect(screen.getByRole('status')).toHaveTextContent('1 result')
  fireEvent.change(input, { target: { value: 'SuBsCrIpTiOnS' } })
  expect(await screen.findByText('Spotify', {}, { timeout: 2000 })).toBeVisible()
  expect(screen.getByText('Netflix')).toBeVisible()
  expect(screen.getByRole('status')).toHaveTextContent('2 results')
})

it('restarts debounce when returning to a cached term and cancels a pending term on clear', async () => {
  server.use(http.get('*/api/transactions', () => HttpResponse.json({ transactions: [{ ...recent, description: 'Cached row' }], total: 1 })))
  const { input } = setup()
  fireEvent.change(input, { target: { value: 'a' } })
  await screen.findByText('Cached row')
  vi.useFakeTimers()
  fireEvent.change(input, { target: { value: 'b' } })
  fireEvent.change(input, { target: { value: 'a' } })
  expect(screen.queryByText('Cached row')).not.toBeInTheDocument()
  await act(async () => { await vi.advanceTimersByTimeAsync(299) })
  expect(screen.getByRole('status')).toHaveTextContent('Searching transactions…')
  await act(async () => { await vi.advanceTimersByTimeAsync(10) })
  expect(screen.getByText('Cached row')).toBeVisible()
  fireEvent.change(input, { target: { value: 'pending' } })
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  await act(async () => { await vi.advanceTimersByTimeAsync(500) })
  expect(screen.getByText('Recent row')).toBeVisible()
  expect(screen.getByRole('status')).toBeEmptyDOMElement()
  fireEvent.change(input, { target: { value: '   ' } })
  expect(screen.getByText('Recent row')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Clear search' })).toBeEnabled()
})


it('keeps the newer term visible when an older response finishes later', async () => {
  let finishOlder!: () => void
  server.use(http.get('*/api/transactions', async ({ request }) => {
    const term = new URL(request.url).searchParams.get('q')
    if (term === 'older') await new Promise<void>(resolve => { finishOlder = resolve })
    return HttpResponse.json({ transactions: [{ ...recent, description: term === 'older' ? 'Older response' : 'Newer response' }], total: 1 })
  }))
  const { input } = setup()
  fireEvent.change(input, { target: { value: 'older' } })
  await waitFor(() => expect(finishOlder).toBeTypeOf('function'))
  fireEvent.change(input, { target: { value: 'newer' } })
  expect(await screen.findByText('Newer response')).toBeVisible()
  await act(async () => { finishOlder() })
  expect(screen.getByText('Newer response')).toBeVisible()
  expect(screen.queryByText('Older response')).not.toBeInTheDocument()
})
