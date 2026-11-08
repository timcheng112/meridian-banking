import { StrictMode } from 'react'
import { readFileSync } from 'node:fs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Account, Customer, Transaction } from './api/types'
import { formatMoney, formatShortDate } from './lib/format'
import { server } from './test/setup'
import App from './App'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})

const clients: QueryClient[] = []
function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30_000 } } })
  clients.push(client)
  render(<StrictMode><QueryClientProvider client={client}><App /></QueryClientProvider></StrictMode>)
  return client
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.dataset.theme = 'light'
  document.documentElement.dataset.segment = 'retail'
  delete document.documentElement.dataset.segmentOverride
})

afterEach(() => {
  cleanup()
  server.events.removeAllListeners('request:start')
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
  it('disables both transfer placements while loading, then opens the loaded transfer dialog', async () => {
    let release!: () => void
    const pending = new Promise<void>((resolve) => { release = resolve })
    server.use(http.get('*/api/accounts', async () => {
      await pending
      // Fall through to the supplied handler after releasing the request.
    }))
    renderApp()
    try {
      const buttons = screen.getAllByRole('button', { name: 'New transfer', hidden: true })
      expect(buttons).toHaveLength(2)
      for (const button of buttons) expect(button).toBeDisabled()
    } finally {
      release()
    }
    await screen.findByRole('heading', { name: 'Good evening, Ava' })
    const buttons = screen.getAllByRole('button', { name: 'New transfer' })
    for (const button of buttons) expect(button).toBeEnabled()
    await userEvent.click(buttons[0])
    expect(screen.getByRole('dialog', { name: 'New transfer' })).toBeVisible()
  })

  it('announces loading before showing the loaded dashboard', async () => {
    renderApp()
    expect(screen.getByRole('status')).toHaveTextContent('Loading your dashboard')
    expect(screen.queryByText('Total available')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Customer' })).toBeEmptyDOMElement()
    await screen.findByRole('heading', { name: 'Good evening, Ava' })
    expect(screen.queryByText('Loading your dashboard')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ava Chen' })).toHaveTextContent('AC')
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
    for (const button of screen.getAllByRole('button', { name: 'New transfer' })) expect(button).toBeEnabled()
    expect(screen.getByRole('searchbox', { name: 'Search transactions' })).toBeEnabled()
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
  it('exposes navigation and synchronized theme and segment controls with explicit-choice persistence', async () => {
    const store = vi.spyOn(Storage.prototype, 'setItem')
    try {
      renderApp()
      await screen.findByRole('heading', { name: 'Good evening, Ava' })
      const overview = within(screen.getByRole('navigation', { hidden: true })).getByText('Overview')
      expect(overview).toHaveAttribute('aria-current', 'page')
      expect(overview).not.toHaveAttribute('href')
      expect(overview).not.toHaveAttribute('tabindex')
      expect(screen.queryByRole('link', { name: 'Overview', hidden: true })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Overview', hidden: true })).not.toBeInTheDocument()
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
      expect(store).toHaveBeenCalledWith('meridian:theme:v1', 'dark')
      expect(localStorage.getItem('meridian:theme:v1')).toBe('light')
      expect(localStorage.getItem('meridian:segment:v1')).toBe('retail')
      cleanup()
      expect(document.documentElement).toHaveAttribute('data-theme', 'light')
      expect(document.documentElement).toHaveAttribute('data-segment', 'retail')
    } finally { store.mockRestore() }
  })

  it('uses the server segment by default and preserves an explicit selection through refresh', async () => {
    server.use(http.get('*/api/customer', () => HttpResponse.json({ customer: { ...customer, segment: 'premium' } })))
    const client = renderApp()
    await screen.findByRole('heading', { name: 'Good evening, Maya' })
    expect(screen.getByRole('img', { name: 'Maya Tan' })).toHaveTextContent('MT')
    expect(screen.queryByLabelText('Ava Chen')).not.toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-segment', 'premium')
    await userEvent.click(screen.getAllByRole('button', { name: 'Retail' })[0])
    await act(async () => { await client.invalidateQueries() })
    expect(document.documentElement).toHaveAttribute('data-segment', 'retail')
    for (const button of screen.getAllByRole('button', { name: 'Retail', hidden: true })) expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})


describe('invalid response Retry presentation', () => {
  it('shows the existing initial error and retries after the invalid response is removed', async () => {
    server.use(http.get('*/api/accounts', () => new HttpResponse('<html>Vite</html>')))
    const client = renderApp()
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load your dashboard.")
    await waitFor(() => expect(client.isFetching()).toBe(0))
    server.resetHandlers()
    const retry = screen.getByRole('button', { name: 'Retry' })
    retry.focus()
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: 'Good evening, Ava' })).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('preserves loaded content and shows the existing warning after invalid refresh', async () => {
    const client = renderApp()
    await screen.findByRole('heading', { name: 'Good evening, Ava' })
    server.use(http.get('*/api/accounts', () => HttpResponse.json(null)))
    await act(async () => { await client.invalidateQueries() })
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't refresh your dashboard. Showing previously loaded data.")
    expectMoney(screen.getByRole('region', { name: 'Total available' }), 17120.55)
    expect(screen.getByRole('heading', { name: 'FairPrice Finest' })).toBeVisible()
    server.resetHandlers()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })
})


it('round-trips explicit choices through the actual bootstrap on remount', async () => {
  renderApp()
  await screen.findByRole('heading', { name: 'Good evening, Ava' })
  await userEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
  await userEvent.click(screen.getAllByRole('button', { name: 'Premium' })[0])
  cleanup()
  document.documentElement.dataset.theme = 'light'
  document.documentElement.dataset.segment = 'retail'
  const html = readFileSync('index.html', 'utf8')
  const script = html.match(/<script id="preference-bootstrap">([\s\S]*?)<\/script>/)?.[1]
  expect(script).toBeDefined()
  new Function(script ?? '')()
  renderApp()
  expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeEnabled()
  expect(document.documentElement).toHaveAttribute('data-segment', 'premium')
  await screen.findByRole('heading', { name: 'Good evening, Ava' })
  expect(document.documentElement).toHaveAttribute('data-segment', 'premium')
})

it('keeps an explicit segment selected before customer arrival and tolerates blocked writes', async () => {
  server.use(http.get('*/api/customer', async () => {
    await delay(100)
    return HttpResponse.json({ customer: { ...customer, segment: 'premium' } })
  }))
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  renderApp()
  await userEvent.click(screen.getAllByRole('button', { name: 'Retail' })[0])
  await userEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
  await screen.findByRole('heading', { name: 'Good evening, Maya' })
  expect(document.documentElement).toHaveAttribute('data-segment', 'retail')
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
})

it('starts payee reads only on opening and restores the opener with a fresh draft on reopen', async () => {
  let payeeReads = 0
  server.use(http.get('*/api/payees', () => { payeeReads++; return HttpResponse.json({ payees: [] }) }))
  renderApp()
  await screen.findByRole('heading', { name: 'Good evening, Ava' })
  expect(payeeReads).toBe(0)
  const opener = screen.getAllByRole('button', { name: 'New transfer' })[0]
  // jsdom has no layout; model this opener as the visible responsive placement.
  vi.spyOn(opener, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList)
  await userEvent.click(opener)
  await screen.findByText('No saved payees.')
  expect(payeeReads).toBeGreaterThan(0)
  await userEvent.click(screen.getByRole('button', { name: /Send to someone new/ }))
  await userEvent.type(screen.getByLabelText('Recipient name'), 'Discard me')
  await userEvent.click(screen.getByRole('button', { name: 'Close transfer' }))
  await waitFor(() => expect(opener).toHaveFocus())
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  await userEvent.click(opener)
  expect(screen.getByRole('heading', { name: 'Who are you sending to?' })).toHaveFocus()
  await userEvent.click(screen.getByRole('button', { name: /Send to someone new/ }))
  expect(screen.getByLabelText('Recipient name')).toHaveValue('')
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  await waitFor(() => expect(opener).toHaveFocus())
})

async function openTransferReview(note = '') {
  await screen.findByRole('heading', { name: 'Good evening, Ava' })
  await userEvent.click(screen.getAllByRole('button', { name: 'New transfer' })[0])
  await userEvent.click(await screen.findByRole('radio', { name: /Jamie Tan/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await userEvent.type(screen.getByLabelText('Amount'), '120')
  if (note) await userEvent.type(screen.getByLabelText('Note (optional)'), note)
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
}

describe('successful transfer and refresh', () => {
  it('uses the API receipt and refreshes balances, daily limit and newest transaction without reloading', async () => {
    let posts = 0
    server.events.on('request:start', ({ request }) => { if (request.method === 'POST') posts++ })
    renderApp(); await openTransferReview('Dinner')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
    expect(await screen.findByRole('heading', { name: 'Transfer sent' })).toBeVisible()
    expect(screen.getByText(/^Reference TRF-/)).toBeVisible()
    expectMoney(screen.getByRole('region', { name: 'Total available' }), 17120.55)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeEnabled())
    expectMoney(screen.getByRole('region', { name: 'Total available' }), 17000.55)
    expectMoney(screen.getByRole('region', { name: 'Daily transfer limit' }), 4880)
    const checking = within(screen.getByRole('region', { name: 'Accounts' })).getAllByRole('article')[0]
    expectMoney(checking, 4160.55)
    expect(screen.getByRole('heading', { name: 'Transfer to Jamie Tan' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Back to dashboard' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: 'New transfer' })[0])
    expect(screen.getByRole('heading', { name: 'Who are you sending to?' })).toHaveFocus()
    expect(screen.queryByText(/^Reference TRF-/)).not.toBeInTheDocument()
    expect(posts).toBe(1)
    server.events.removeAllListeners('request:start')
  })

  it('keeps successful receipt when accounts refresh fails and retries GETs only', async () => {
    let posts = 0
    const started = new Set<string>()
    let sending = false
    const observe = ({ request }: { request: Request }) => {
      const path = new URL(request.url).pathname
      if (request.method === 'POST') { posts++; sending = true }
      else if (sending) started.add(path)
    }
    server.events.on('request:start', observe)
    const client = renderApp(); await openTransferReview()
    server.use(http.get('*/api/accounts', errorResponse))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
    await screen.findByRole('heading', { name: 'Transfer sent' })
    expect(await screen.findByText("Transfer sent, but we couldn't refresh your dashboard. Your transfer is complete. Try refreshing the dashboard.")).toBeVisible()
    expect(posts).toBe(1)
    expect(started).toEqual(new Set(['/api/customer', '/api/accounts', '/api/transactions']))
    expect(client.getQueryData(['accounts'])).toBeDefined()
    expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Confirm transfer' })).not.toBeInTheDocument()
    server.resetHandlers()
    await userEvent.click(screen.getByRole('button', { name: 'Retry dashboard refresh' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeEnabled())
    expect(screen.queryByText(/Transfer sent, but we couldn't/)).not.toBeInTheDocument()
    expectMoney(screen.getByRole('region', { name: 'Total available' }), 17000.55)
    expect(posts).toBe(1)
    server.events.removeListener('request:start', observe)
  })

  it('retains a hidden pending session, announces success without focus theft and reopens its receipt', async () => {
    let finish!: () => void
    const held = new Promise<void>((resolve) => { finish = resolve })
    let posts = 0
    // A test-local handler provides an API receipt while dashboard GETs use the supplied data.
    server.use(http.post('*/api/transfers', async () => {
      posts++
      await held
      return HttpResponse.json({ transfer: { id: 't', reference: 'TRF-HIDDEN', status: 'completed', fromAccountId: 'acc_checking', recipient: { name: 'Jamie Tan', bank: 'DBS', accountNumberMasked: '•••• 3391' }, amount: 120, fee: 0, currency: 'SGD', note: null, createdAt: '2026-11-08T12:00:00Z' }, account: { id: 'acc_checking', balance: 4160.55 }, dailyLimit: { limit: 5000, used: 120, remaining: 4880 } }, { status: 201 })
    }))
    renderApp(); await openTransferReview()
    const opener = screen.getAllByRole('button', { name: 'New transfer' })[0]
    vi.spyOn(opener, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList)
    await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
    await screen.findByRole('button', { name: 'Sending…' })
    await userEvent.click(screen.getByRole('button', { name: 'Close transfer' }))
    await waitFor(() => expect(opener).toHaveFocus())
    expect(document.body.style.overflow).toBe('')
    expect(screen.getByText('Sending transfer… Open New transfer to view its status.')).toHaveAttribute('role', 'status')
    await userEvent.click(opener)
    expect(screen.getByRole('heading', { name: 'Check the details' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Close transfer' }))
    await waitFor(() => expect(opener).toHaveFocus())
    finish()
    expect(await screen.findByText('Transfer sent. Open New transfer to view the confirmation.')).toBeVisible()
    expect(opener).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
    await userEvent.click(opener)
    expect(screen.getByRole('heading', { name: 'Transfer sent' })).toHaveFocus()
    expect(screen.getByText('Reference TRF-HIDDEN')).toBeVisible()
    expect(posts).toBe(1)
  })

  it('retains a hidden failure and intact draft until its visible outcome is dismissed', async () => {
    let finish!: () => void
    const held = new Promise<void>((resolve) => { finish = resolve })
    server.use(http.post('*/api/transfers', async () => { await held; return errorResponse() }))
    renderApp(); await openTransferReview('Retained draft')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
    await screen.findByRole('button', { name: 'Sending…' })
    await userEvent.click(screen.getByRole('button', { name: 'Close transfer' }))
    finish()
    expect(await screen.findByText('Transfer failed. Open New transfer to review and try again.')).toBeVisible()
    await userEvent.click(screen.getAllByRole('button', { name: 'New transfer' })[0])
    expect(screen.getByRole('alert')).toHaveFocus()
    expect(screen.getByText('Retained draft')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Close transfer' }))
    await userEvent.click(screen.getAllByRole('button', { name: 'New transfer' })[0])
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Who are you sending to?' })).toHaveFocus()
  })

  it('invalidates active and inactive search caches and preserves the search term and Clear behavior', async () => {
    const client = renderApp()
    await screen.findByRole('heading', { name: 'Good evening, Ava' })
    const search = screen.getByRole('searchbox', { name: 'Search transactions' })
    await userEvent.type(search, 'Jamie')
    await screen.findByText('1 result')
    await userEvent.clear(search)
    await userEvent.type(search, 'groceries')
    await screen.findByText('1 result')
    await openTransferReview()
    await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
    await screen.findByRole('heading', { name: 'Transfer sent' })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeEnabled())
    expect(search).toHaveValue('groceries')
    expect(screen.getByRole('heading', { name: 'FairPrice Finest' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Transfer to Jamie Tan' })).not.toBeInTheDocument()
    expect(client.getQueryState(['transactions', { limit: 8, q: 'Jamie' }])?.isInvalidated).toBe(true)
    await userEvent.click(screen.getByRole('button', { name: 'Back to dashboard' }))
    // jsdom has no visible opener; wait for the scheduled fallback focus before typing.
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Good evening, Ava' })).toHaveFocus())
    await userEvent.clear(search)
    await userEvent.type(search, 'Jamie')
    expect(search).toHaveValue('Jamie')
    await waitFor(() => expect(client.getQueryData<{ total: number }>(['transactions', { limit: 8, q: 'Jamie' }])?.total).toBe(2), { timeout: 2000 })
    expect(await screen.findByText('2 results')).toBeVisible()
    expect(screen.getAllByRole('heading', { name: 'Transfer to Jamie Tan' })).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(search).toHaveValue('')
    expect(screen.getAllByRole('heading', { name: 'Transfer to Jamie Tan' })).toHaveLength(1)
  }, 10_000)
})

it('replaces an in-flight pre-transfer account read so its late stale result cannot overwrite refresh', async () => {
  const client = renderApp(); await openTransferReview()
  const cached = client.getQueryData<{ accounts: Account[] }>(['accounts'])!
  let release!: () => void
  const held = new Promise<void>((resolve) => { release = resolve })
  let reads = 0
  server.use(http.get('*/api/accounts', async () => {
    reads++
    if (reads === 1) { await held; return HttpResponse.json(cached) }
    return HttpResponse.json({ accounts: cached.accounts.map((account) => account.id === 'acc_checking' ? { ...account, balance: 4160.55 } : account) })
  }))
  let oldRead!: Promise<void>
  act(() => { oldRead = client.refetchQueries({ queryKey: ['accounts'] }) })
  await waitFor(() => expect(reads).toBe(1))
  await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
  await screen.findByRole('heading', { name: 'Transfer sent' })
  await waitFor(() => expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeEnabled())
  expect(reads).toBe(2)
  expectMoney(screen.getByRole('region', { name: 'Total available' }), 17000.55)
  await act(async () => { release(); await oldRead })
  expectMoney(screen.getByRole('region', { name: 'Total available' }), 17000.55)
})

it('reports active search refresh failure independently and retries the transaction family without another POST', async () => {
  let posts = 0
  const observe = ({ request }: { request: Request }) => { if (request.method === 'POST') posts++ }
  server.events.on('request:start', observe)
  renderApp()
  await screen.findByRole('heading', { name: 'Good evening, Ava' })
  await userEvent.type(screen.getByRole('searchbox', { name: 'Search transactions' }), 'Jamie')
  await screen.findByText('1 result')
  await openTransferReview()
  server.use(http.get('*/api/transactions', ({ request }) => {
    if (new URL(request.url).searchParams.has('q')) return errorResponse()
  }))
  await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
  await screen.findByRole('heading', { name: 'Transfer sent' })
  await screen.findByText("Transfer sent, but we couldn't refresh your dashboard. Your transfer is complete. Try refreshing the dashboard.")
  expect(screen.queryByText("We couldn't refresh your dashboard. Showing previously loaded data.")).not.toBeInTheDocument()
  expect(screen.getByText("We couldn't refresh your search results. Showing previously loaded results.")).toBeVisible()
  server.resetHandlers()
  await userEvent.click(screen.getByRole('button', { name: 'Retry dashboard refresh' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeEnabled())
  expect(await screen.findByText('2 results')).toBeVisible()
  expect(posts).toBe(1)
})

it('replaces an initial search read with no cached data before refreshing after a transfer', async () => {
  let release!: () => void
  const held = new Promise<void>((resolve) => { release = resolve })
  let searchReads = 0
  server.use(http.get('*/api/transactions', async ({ request }) => {
    if (!new URL(request.url).searchParams.has('q')) return
    searchReads++
    if (searchReads === 1) { await held; return HttpResponse.json({ transactions: [], total: 0 }) }
    return HttpResponse.json({ transactions: [{ ...transaction, id: 'new-transfer', description: 'Transfer to Jamie Tan', category: 'transfer' }], total: 1 })
  }))
  renderApp()
  await screen.findByRole('heading', { name: 'Good evening, Ava' })
  await userEvent.type(screen.getByRole('searchbox', { name: 'Search transactions' }), 'Jamie')
  await waitFor(() => expect(searchReads).toBe(1))
  await openTransferReview()
  await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
  await screen.findByRole('heading', { name: 'Transfer sent' })
  await waitFor(() => expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeEnabled())
  expect(searchReads).toBe(2)
  expect(screen.getByText('1 result')).toBeVisible()
  await act(async () => { release(); await held })
  expect(screen.getByText('1 result')).toBeVisible()
  expect(screen.queryByText('No transactions match your search.')).not.toBeInTheDocument()
})

it('preserves a newer receipt and refresh status after an older dismissed receipt refresh settles', async () => {
  const client = renderApp(); await openTransferReview()
  const cached = client.getQueryData<{ accounts: Account[] }>(['accounts'])!
  let releaseOld!: () => void
  let releaseNew!: () => void
  const oldRead = new Promise<void>((resolve) => { releaseOld = resolve })
  const newRead = new Promise<void>((resolve) => { releaseNew = resolve })
  let reads = 0
  server.use(http.get('*/api/accounts', async () => {
    const attempt = ++reads
    await (attempt === 1 ? oldRead : newRead)
    return HttpResponse.json({ accounts: cached.accounts.map((account) => account.id === 'acc_checking' ? { ...account, balance: attempt === 1 ? 4160.55 : 4040.55 } : account) })
  }))
  await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
  await screen.findByRole('heading', { name: 'Transfer sent' })
  const oldReference = screen.getByText(/^Reference TRF-/).textContent
  expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Close transfer' }))
  await openTransferReview()
  await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
  await screen.findByRole('heading', { name: 'Transfer sent' })
  await waitFor(() => expect(reads).toBe(2))
  const newReference = screen.getByText(/^Reference TRF-/).textContent
  expect(newReference).not.toBe(oldReference)
  await act(async () => { releaseOld(); await oldRead })
  expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeDisabled()
  expect(screen.getByText('Transfer sent. Updating your dashboard…')).toBeVisible()
  expect(screen.getByText(/^Reference TRF-/)).toHaveTextContent(newReference!)
  await act(async () => { releaseNew(); await newRead })
  await waitFor(() => expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeEnabled())
  expectMoney(screen.getByRole('region', { name: 'Total available' }), 16880.55)
}, 10_000)
