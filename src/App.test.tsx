import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Account, Customer, Transaction } from './api/types'
import { formatMoney, formatShortDate } from './lib/format'
import { server } from './test/setup'
import App from './App'

const clients: QueryClient[] = []
function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30_000 } } })
  clients.push(client)
  render(<QueryClientProvider client={client}><App /></QueryClientProvider>)
  return client
}

afterEach(() => {
  cleanup()
  clients.forEach((client) => client.clear())
  clients.length = 0
})

const normalize = (value: string) => value.replace(/\s+/g, ' ')
function expectMoney(container: HTMLElement, amount: number, prefix = '') {
  expect(container).toHaveTextContent(normalize(prefix + formatMoney(amount)))
}
const customer: Customer = {
  id: 'customer', firstName: 'Maya', lastName: 'Tan', email: 'maya@example.com',
  segment: 'retail', dailyTransferLimit: 8000, transferredToday: 1250,
}
const account: Account = {
  id: 'deposit', name: 'Travel savings', type: 'savings', maskedNumber: '•••• 1234', balance: 125.75, currency: 'SGD',
}
const transaction: Transaction = {
  id: 'refund', accountId: 'deposit', date: '2026-11-01T23:30:00Z',
  description: 'Travel refund', category: 'refunds', direction: 'in', amount: 12.5, status: 'pending',
}
const errorResponse = () => HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Down' } }, { status: 500 })

describe('dashboard', () => {
  it('announces loading before showing the loaded dashboard', async () => {
    renderApp()
    expect(screen.getByRole('status')).toHaveTextContent('Loading your dashboard')
    expect(screen.queryByText('Total available')).not.toBeInTheDocument()
    await screen.findByRole('heading', { name: 'Good evening, Ava' })
    expect(screen.queryByText('Loading your dashboard')).not.toBeInTheDocument()
  })

  it('shows deposit totals, all account cards and the eight server-ordered transactions', async () => {
    renderApp()
    await screen.findByRole('heading', { name: 'Good evening, Ava' })
    const total = screen.getByRole('region', { name: 'Total available' })
    expectMoney(total, 17120.55)
    expect(total).toHaveTextContent('Across 2 deposit accounts')
    const cards = within(screen.getByRole('region', { name: 'Accounts' })).getAllByRole('article')
    expect(cards).toHaveLength(3)
    for (const [index, [name, mask, balance]] of ([
      ['Everyday Checking', '•••• 4821', 4280.55],
      ['Savings Plus', '•••• 9930', 12840],
      ['Rewards Card', '•••• 7712', -420.3],
    ] as const).entries()) {
      expect(cards[index]).toHaveTextContent(name)
      expect(cards[index]).toHaveTextContent(mask)
      expectMoney(cards[index], balance)
    }
    expect(cards[2]).toHaveTextContent('Amount due')
    const rows = within(screen.getByRole('list', { name: 'Recent transactions' })).getAllByRole('listitem')
    expect(rows).toHaveLength(8)
    expect(rows.map((row) => within(row).getByRole('heading').textContent)).toEqual([
      'FairPrice Finest', 'Grab', 'Kopitiam Corner', 'Spotify', 'PayNow from Marcus Lee',
      'Salary \u2014 Northwind Labs', 'SP Group', 'Uniqlo',
    ])
    expectMoney(rows[0], -86.4)
    expect(rows[0]).toHaveTextContent('groceries')
    expect(rows[0]).toHaveTextContent(formatShortDate('2026-10-19T18:42:00+08:00'))
    expectMoney(rows[4], 45, '+')
    expect(rows[1]).toHaveTextContent('Pending')
    expect(screen.getAllByText('Pending')).toHaveLength(1)
    expectMoney(screen.getByRole('region', { name: 'Daily transfer limit' }), 5000)
    for (const button of screen.getAllByRole('button', { name: 'New transfer' })) expect(button).toBeDisabled()
    expect(screen.getByRole('searchbox', { name: 'Search transactions' })).toBeDisabled()
  })

  it('derives changed totals, singular deposit count, greeting and remaining limit', async () => {
    server.use(
      http.get('*/api/customer', () => HttpResponse.json({ customer })),
      http.get('*/api/accounts', () => HttpResponse.json({ accounts: [account, { ...account, id: 'credit', type: 'credit', balance: -900 }] })),
      http.get('*/api/transactions', () => HttpResponse.json({ transactions: [transaction], total: 1 })),
    )
    renderApp()
    await screen.findByRole('heading', { name: 'Good evening, Maya' })
    const total = screen.getByRole('region', { name: 'Total available' })
    expectMoney(total, 125.75)
    expect(total).toHaveTextContent('Across 1 deposit account')
    expect(total).not.toHaveTextContent('deposit accounts')
    expectMoney(screen.getByRole('region', { name: 'Daily transfer limit' }), 6750)
    const row = within(screen.getByRole('list', { name: 'Recent transactions' })).getByRole('listitem')
    expect(row).toHaveTextContent('Travel refund')
    expect(row).toHaveTextContent('refunds')
    expect(row).toHaveTextContent(formatShortDate(transaction.date))
    expect(row).toHaveTextContent('Pending')
    expectMoney(row, 12.5, '+')
  })

  it('retries a failed GET through the button and prevents another click while fetching', async () => {
    server.use(http.get('*/api/accounts', errorResponse))
    const client = renderApp()
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load your dashboard.")
    await waitFor(() => expect(client.isFetching()).toBe(0))
    const retry = screen.getByRole('button', { name: 'Retry' })
    server.resetHandlers()
    await userEvent.click(retry)
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Loading your dashboard')
    expect(await screen.findByRole('heading', { name: 'Good evening, Ava' })).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps cached content visible after refresh failure and clears the warning on Retry', async () => {
    const client = renderApp()
    await screen.findByRole('heading', { name: 'Good evening, Ava' })
    server.use(http.get('*/api/accounts', errorResponse))
    await act(async () => { await client.invalidateQueries() })
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't refresh your dashboard. Showing previously loaded data.")
    expectMoney(screen.getByRole('region', { name: 'Total available' }), 17120.55)
    expect(screen.getByRole('heading', { name: 'FairPrice Finest' })).toBeVisible()
    server.resetHandlers()
    server.use(http.get('*/api/accounts', async () => {
      await delay(500)
      return HttpResponse.json({ accounts: [account] })
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDisabled()
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expectMoney(screen.getByRole('region', { name: 'Total available' }), 125.75)
  })

  it('shows approved empty-list copy and a zero deposit total/count', async () => {
    server.use(
      http.get('*/api/accounts', () => HttpResponse.json({ accounts: [] })),
      http.get('*/api/transactions', () => HttpResponse.json({ transactions: [], total: 0 })),
    )
    renderApp()
    await screen.findByRole('heading', { name: 'Good evening, Ava' })
    expect(screen.getByText('No accounts to display.')).toBeVisible()
    expect(screen.getByText('No recent transactions.')).toBeVisible()
    expectMoney(screen.getByRole('region', { name: 'Total available' }), 0)
    expect(screen.getByText('Across 0 deposit accounts')).toBeVisible()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Recent transactions' })).not.toBeInTheDocument()
  })
})


describe('header preferences', () => {
  it('exposes navigation and synchronized in-memory theme and segment controls without persistence', async () => {
    const store = vi.spyOn(Storage.prototype, 'setItem')
    try {
      renderApp()
      await screen.findByRole('heading', { name: 'Good evening, Ava' })
      expect(screen.getByRole('link', { name: 'Overview', hidden: true })).toHaveAttribute('href', '#main-content')
      for (const label of ['Cards', 'Payments', 'Insights']) expect(screen.getByRole('button', { name: label, hidden: true })).toBeDisabled()
      const theme = screen.getByRole('button', { name: 'Switch to dark mode' })
      expect(theme).toHaveAttribute('title', 'Switch to dark mode')
      expect(document.documentElement).toHaveAttribute('data-theme', 'light')
      await userEvent.click(theme)
      expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBe(theme)
      expect(theme).toHaveAttribute('title', 'Switch to light mode')
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
      await userEvent.click(theme)
      expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBe(theme)
      expect(document.documentElement).toHaveAttribute('data-theme', 'light')
      await userEvent.click(screen.getAllByRole('button', { name: 'Premium' })[0])
      expect(document.documentElement).toHaveAttribute('data-segment', 'premium')
      for (const button of screen.getAllByRole('button', { name: 'Premium', hidden: true })) expect(button).toHaveAttribute('aria-pressed', 'true')
      await userEvent.click(screen.getAllByRole('button', { name: 'Retail' })[0])
      for (const button of screen.getAllByRole('button', { name: 'Retail', hidden: true })) expect(button).toHaveAttribute('aria-pressed', 'true')
      expect(document.documentElement).toHaveAttribute('data-segment', 'retail')
      expect(store).not.toHaveBeenCalled()
      cleanup()
      expect(document.documentElement).not.toHaveAttribute('data-theme')
      expect(document.documentElement).not.toHaveAttribute('data-segment')
    } finally { store.mockRestore() }
  })

  it('uses the server segment by default and preserves an explicit selection through refresh', async () => {
    server.use(http.get('*/api/customer', () => HttpResponse.json({ customer: { ...customer, segment: 'premium' } })))
    const client = renderApp()
    await screen.findByRole('heading', { name: 'Good evening, Maya' })
    expect(screen.getByLabelText('Maya Tan')).toHaveTextContent('MT')
    expect(screen.queryByLabelText('Ava Chen')).not.toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-segment', 'premium')
    await userEvent.click(screen.getAllByRole('button', { name: 'Retail' })[0])
    await act(async () => { await client.invalidateQueries() })
    expect(document.documentElement).toHaveAttribute('data-segment', 'retail')
    for (const button of screen.getAllByRole('button', { name: 'Retail', hidden: true })) expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})
