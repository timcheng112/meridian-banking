import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { Account, Customer } from '../../api/types'
import { server } from '../../test/setup'
import { useTransferSubmission } from './useTransferSubmission'
import { TransferDialog } from './TransferDialog'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
const customer: Customer = { id: 'c', firstName: 'Ava', lastName: 'Chen', email: '', segment: 'retail', dailyTransferLimit: 5000, transferredToday: 0 }
const accounts: Account[] = [
  { id: 'checking', name: 'Everyday Checking', type: 'checking', maskedNumber: '•••• 4821', balance: 4280.55, currency: 'SGD' },
  { id: 'savings', name: 'Savings Plus', type: 'savings', maskedNumber: '•••• 9930', balance: 60, currency: 'SGD' },
  { id: 'credit', name: 'Rewards Card', type: 'credit', maskedNumber: '•••• 7712', balance: 1000, currency: 'SGD' },
]
function TestDialog({ customer: customerData = customer, accounts: accountData, onClose }: { customer?: Customer; accounts: Account[]; onClose: () => void }) {
  const submission = useTransferSubmission()
  return <TransferDialog customer={customerData} accounts={accountData} onClose={onClose} visible submission={submission} onInvalid={() => {}} />
}
const clients: QueryClient[] = []
function setup(accountData = accounts) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30_000 } } })
  clients.push(client)
  const onClose = vi.fn()
  const view = render(<StrictMode><QueryClientProvider client={client}><TestDialog customer={customer} accounts={accountData} onClose={onClose} /></QueryClientProvider></StrictMode>)
  return { client, onClose, ...view }
}
afterEach(() => { cleanup(); clients.forEach((client) => client.clear()); clients.length = 0 })
const next = () => userEvent.click(screen.getByRole('button', { name: 'Continue' }))
async function savedAmount() {
  await userEvent.click(await screen.findByRole('radio', { name: /Jamie Tan/ }))
  await next()
  expect(screen.getByRole('heading', { name: 'How much?' })).toHaveFocus()
}
const fail = () => HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Down' } }, { status: 500 })

describe('transfer draft', () => {
  it('uses one saved-recipient draft through review and Back, without posting', async () => {
    let posts = 0
    server.use(http.post('*/api/transfers', () => { posts++; return HttpResponse.json({}) }))
    setup()
    expect(screen.getByRole('dialog', { name: 'New transfer' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Who are you sending to?' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await savedAmount()
    expect(screen.queryByRole('option', { name: /Rewards Card/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '100' }))
    await userEvent.type(screen.getByLabelText('Note (optional)'), 'Dinner')
    expect(screen.getByText('6/50')).toBeVisible()
    await next()
    expect(screen.getByRole('heading', { name: 'Check the details' })).toHaveFocus()
    expect(screen.getByText('Jamie Tan')).toBeVisible()
    expect(screen.getByText('DBS · •••• 3391')).toBeVisible()
    expect(screen.getByText('Dinner')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Confirm transfer' })).toBeEnabled()
    await userEvent.keyboard('{Enter}')
    expect(posts).toBe(0)
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByLabelText('Amount')).toHaveValue('100.00')
    expect(screen.getByLabelText('Note (optional)')).toHaveValue('Dinner')
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('radio', { name: /Jamie Tan/ })).toBeChecked()
  })

  it('toggles the inline new-recipient disclosure with Space and Enter while retaining focus and saved selection', async () => {
    setup()
    const saved = await screen.findByRole('radio', { name: /Jamie Tan/ })
    await userEvent.click(saved)
    const toggle = screen.getByRole('button', { name: 'Send to someone new' })
    expect(toggle).toHaveAccessibleDescription('Enter their details below')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.tab()
    expect(toggle).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(toggle).toHaveFocus()
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByLabelText('Recipient name')).toBeVisible()
    expect(saved).toBeVisible()
    expect(saved).not.toBeChecked()
    await userEvent.keyboard('{Enter}')
    expect(toggle).toHaveFocus()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByLabelText('Recipient name')).not.toBeInTheDocument()
    expect(saved).toBeChecked()
    expect(screen.getByRole('heading', { name: 'Who are you sending to?' })).toBeVisible()
  })

  it('validates new recipient on blur/Continue and reviews the actual Other bank with masked leading-zero account', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /Send to someone new/ }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.click(screen.getByLabelText('Recipient name'))
    await userEvent.tab()
    expect(await screen.findByText('Enter a recipient name between 2 and 50 characters.')).toBeVisible()
    expect(screen.getByLabelText('Recipient name')).toHaveAttribute('aria-describedby', 'recipientName-error')
    await userEvent.type(screen.getByLabelText('Recipient name'), 'Alex Lim')
    await userEvent.type(screen.getByLabelText('Account number (8 digits)'), '00123456')
    await userEvent.selectOptions(screen.getByLabelText('Bank'), 'other')
    await userEvent.type(screen.getByLabelText('Bank name'), 'Local Bank')
    await next()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.click(screen.getByLabelText('Amount'))
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'How much?' })).toBeVisible()
    await userEvent.type(screen.getByLabelText('Amount'), '0.99')
    await userEvent.tab()
    expect(await screen.findByText('Enter an amount of at least SGD 1.00.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.clear(screen.getByLabelText('Amount'))
    await userEvent.type(screen.getByLabelText('Amount'), '120{Enter}')
    await screen.findByRole('heading', { name: 'Check the details' })
    expect(screen.getByText('Local Bank · •••• 3456')).toBeVisible()
    expect(screen.queryByText('00123456')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByLabelText('Bank name')).toHaveValue('Local Bank')
    await userEvent.click(await screen.findByRole('radio', { name: /Jamie Tan/ }))
    expect(screen.queryByLabelText('Bank name')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Send to someone new/ }))
    expect(screen.getByLabelText('Bank name')).toHaveValue('Local Bank')
  })

  it.each([
    ['accountNumber', 'Account number (8 digits)'],
    ['bankChoice', 'Bank'],
    ['bankName', 'Bank name'],
  ] as const)('links the invalid native %s field error after blur', async (name, label) => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Send to someone new' }))
    await userEvent.type(screen.getByLabelText('Recipient name'), 'Alex Lim')
    if (name !== 'accountNumber') await userEvent.type(screen.getByLabelText('Account number (8 digits)'), '00123456')
    if (name === 'bankName') await userEvent.selectOptions(screen.getByLabelText('Bank'), 'other')
    const input = screen.getByLabelText(label)
    await userEvent.click(input)
    await userEvent.tab()
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', `${name}-error`)
    expect(document.getElementById(`${name}-error`)).toBeVisible()
  })

  it('updates amount errors when the selected account changes and checks note boundaries', async () => {
    setup(); await savedAmount()
    await userEvent.click(screen.getByRole('button', { name: '100' }))
    await userEvent.selectOptions(screen.getByLabelText('From account'), 'savings')
    expect(await screen.findByText(/Amount can't be more than your available balance/)).toHaveTextContent('60.00')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Note (optional)'), 'x'.repeat(51))
    await userEvent.tab()
    expect(screen.getByText('51/50')).toBeVisible()
    expect(await screen.findByText('Keep the note to 50 characters or fewer.')).toBeVisible()
  })

  it('preserves the active new recipient after returning from Amount despite an earlier saved selection', async () => {
    setup()
    await userEvent.click(await screen.findByRole('radio', { name: /Jamie Tan/ }))
    await userEvent.click(screen.getByRole('button', { name: /Send to someone new/ }))
    await userEvent.type(screen.getByLabelText('Recipient name'), 'Alex Lim')
    await userEvent.type(screen.getByLabelText('Account number (8 digits)'), '00123456')
    await userEvent.selectOptions(screen.getByLabelText('Bank'), 'OCBC')
    await next()
    await userEvent.selectOptions(screen.getByLabelText('From account'), 'savings')
    await userEvent.click(screen.getByRole('button', { name: '50' }))
    await userEvent.type(screen.getByLabelText('Note (optional)'), 'Lunch')
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('button', { name: /Send to someone new/ })).toHaveAttribute('aria-expanded', 'true')
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
    expect(screen.getByLabelText('Recipient name')).toHaveValue('Alex Lim')
    await next(); await next()
    expect(screen.getByText('Alex Lim')).toBeVisible()
    expect(screen.getByText('OCBC · •••• 3456')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    await userEvent.click(screen.getByRole('radio', { name: /Marcus Lee/ }))
    expect(screen.getByRole('radio', { name: /Marcus Lee/ })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Send to someone new' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByLabelText('Recipient name')).not.toBeInTheDocument()
    await next()
    expect(screen.getByLabelText('From account')).toHaveValue('savings')
    expect(screen.getByLabelText('Amount')).toHaveValue('50.00')
    expect(screen.getByLabelText('Note (optional)')).toHaveValue('Lunch')
    await next()
    expect(screen.getByText('Marcus Lee')).toBeVisible()
    expect(screen.getByText('Lunch')).toBeVisible()
  })

  it('disables Continue for known note errors and reenables during correction, with the same Enter guard', async () => {
    setup(); await savedAmount()
    await userEvent.click(screen.getByRole('button', { name: '50' }))
    const note = screen.getByLabelText('Note (optional)')
    await userEvent.type(note, 'x'.repeat(53))
    await userEvent.tab()
    expect(await screen.findByText('Keep the note to 50 characters or fewer.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.click(note)
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'How much?' })).toBeVisible()
    await userEvent.keyboard('{End}{Backspace}{Backspace}{Backspace}')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(note).toHaveFocus()
    expect(screen.getByText('50/50')).toBeVisible()
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: 'Check the details' })).toBeVisible()
  })

  it('ignores errors in inactive new-recipient fields and hidden Other bank input', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /Send to someone new/ }))
    await next()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.click(await screen.findByRole('radio', { name: /Jamie Tan/ }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: /Send to someone new/ }))
    await userEvent.type(screen.getByLabelText('Recipient name'), 'Alex Lim')
    await userEvent.type(screen.getByLabelText('Account number (8 digits)'), '00123456')
    await userEvent.selectOptions(screen.getByLabelText('Bank'), 'other')
    await userEvent.click(screen.getByLabelText('Bank name'))
    await userEvent.tab()
    expect(await screen.findByText('Enter a bank name between 2 and 30 characters.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.selectOptions(screen.getByLabelText('Bank'), 'DBS')
    expect(screen.queryByLabelText('Bank name')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    await next()
    expect(screen.getByRole('heading', { name: 'How much?' })).toBeVisible()
  })

  it('searches name/bank locally, preserves hidden selection and clears with focus', async () => {
    setup()
    await userEvent.click(await screen.findByRole('radio', { name: /Jamie Tan/ }))
    const search = screen.getByRole('searchbox', { name: 'Search payees' })
    await userEvent.type(search, '  ocbc  ')
    expect(screen.getAllByRole('radio')).toHaveLength(1)
    expect(screen.getByText('Selected: Jamie Tan')).toBeVisible()
    await userEvent.clear(search)
    await userEvent.type(search, 'nothing')
    expect(screen.getByText('No payees match your search.')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(search).toHaveFocus()
    expect(screen.getAllByRole('radio')).toHaveLength(4)
    await next()
    expect(screen.getByRole('heading', { name: 'How much?' })).toBeVisible()
  })

  it('retains new recipient access during loading and initial failure, then retries', async () => {
    server.use(http.get('*/api/payees', async () => { await delay(100); return fail() }))
    const { onClose } = setup()
    expect(screen.getByText('Loading payees…')).toBeVisible()
    expect(screen.getByRole('searchbox')).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /Send to someone new/ }))
    expect(screen.getByLabelText('Recipient name')).toBeVisible()
    expect(await screen.findByText("We couldn't load your payees.")).toBeVisible()
    server.resetHandlers()
    server.use(http.get('*/api/payees', async () => {
      await delay(100)
      return HttpResponse.json({ payees: [{ id: 'p', name: 'Jamie Tan', bank: 'DBS', accountNumberMasked: '•••• 3391', initials: 'JT', lastUsedAt: '' }] })
    }))
    const retry = screen.getByRole('button', { name: 'Retry' })
    await userEvent.click(retry)
    expect(screen.getByRole('button', { name: 'Retry' })).toBe(retry)
    expect(retry).toBeDisabled()
    expect(retry).toHaveFocus()
    await screen.findByRole('radio', { name: /Jamie Tan/ })
    expect(screen.getByLabelText('Recipient name')).toBeVisible()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('distinguishes empty payees and disables Continue without a recipient', async () => {
    server.use(http.get('*/api/payees', () => HttpResponse.json({ payees: [] })))
    setup()
    expect(await screen.findByText('No saved payees.')).toBeVisible()
    expect(screen.getByRole('searchbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /Send to someone new/ }))
    expect(screen.getByLabelText('Recipient name')).toBeVisible()
  })

  it('retains cached selection on failed refresh and retries without clearing draft', async () => {
    const { client } = setup()
    await userEvent.click(await screen.findByRole('radio', { name: /Jamie Tan/ }))
    server.use(http.get('*/api/payees', fail))
    await act(async () => { await client.invalidateQueries({ queryKey: ['payees'] }) })
    expect(await screen.findByText("We couldn't refresh your payees. Showing previously loaded payees.")).toBeVisible()
    expect(screen.getByRole('radio', { name: /Jamie Tan/ })).toBeChecked()
    server.resetHandlers()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(screen.getByRole('radio', { name: /Jamie Tan/ })).toBeChecked()
    let finish!: () => void
    const held = new Promise<void>((resolve) => { finish = resolve })
    server.use(http.get('*/api/payees', async () => {
      await held
      return HttpResponse.json(client.getQueryData(['payees']))
    }))
    let refreshing!: Promise<void>
    act(() => { refreshing = client.invalidateQueries({ queryKey: ['payees'] }) })
    await waitFor(() => expect(client.isFetching({ queryKey: ['payees'] })).toBe(1))
    expect(screen.queryByText("We couldn't refresh your payees. Showing previously loaded payees.")).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Jamie Tan/ })).toBeChecked()
    await act(async () => { finish(); await refreshing })
  })

  it('blocks a removed recipient when advancing from Amount', async () => {
    const { client } = setup(); await savedAmount()
    await userEvent.click(screen.getByRole('button', { name: '50' }))
    act(() => client.setQueryData(['payees'], { payees: [] }))
    await next()
    expect(await screen.findByRole('heading', { name: 'Who are you sending to?' })).toBeVisible()
    expect(screen.getByText('Choose a recipient.')).toBeVisible()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send to someone new' })).toHaveFocus())
  })

  it('revalidates entered amounts against changed external balances and limits', async () => {
    const { client, onClose, rerender } = setup(); await savedAmount()
    await userEvent.click(screen.getByRole('button', { name: '100' }))
    rerender(<StrictMode><QueryClientProvider client={client}><TestDialog customer={customer} accounts={accounts.map((account) => account.id === 'checking' ? { ...account, balance: 70 } : account)} onClose={onClose} /></QueryClientProvider></StrictMode>)
    expect(await screen.findByText(/Amount can't be more than your available balance/)).toHaveTextContent('70.00')
    rerender(<StrictMode><QueryClientProvider client={client}><TestDialog customer={{ ...customer, dailyTransferLimit: 80 }} accounts={accounts} onClose={onClose} /></QueryClientProvider></StrictMode>)
    expect(await screen.findByText(/This transfer exceeds your remaining daily limit/)).toHaveTextContent('80.00')
    expect(screen.getByLabelText('Amount')).toHaveValue('100.00')
    rerender(<StrictMode><QueryClientProvider client={client}><TestDialog customer={customer} accounts={accounts.filter((account) => account.id !== 'checking')} onClose={onClose} /></QueryClientProvider></StrictMode>)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.click(screen.getByLabelText('From account'))
    await userEvent.tab()
    expect(await screen.findByText('Choose a deposit account.')).toBeVisible()
    expect(screen.getByLabelText('From account')).toHaveAttribute('aria-describedby', 'account-help fromAccountId-error')
    expect(screen.getByLabelText('From account')).toHaveAccessibleDescription('Deposit accounts only Choose a deposit account.')
    expect(screen.getByLabelText('Amount')).toHaveValue('100.00')
  })

  it('shows no-deposit treatment without inventing a balance', async () => {
    setup([accounts[2]]); await savedAmount()
    expect(screen.getByText('No deposit accounts are available for transfers.')).toBeVisible()
    expect(screen.getByLabelText('From account')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled()
    expect(screen.queryByText(/^Available /)).not.toBeInTheDocument()
  })

  it('handles Escape, close and Cancel and restores body overflow under StrictMode', async () => {
    document.body.style.overflow = 'auto'
    const { onClose, unmount } = setup()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'Close transfer' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(3)
    unmount()
    expect(document.body.style.overflow).toBe('auto')
    document.body.style.overflow = ''
  })
})

async function savedReview() {
  await savedAmount()
  await userEvent.click(screen.getByRole('button', { name: '100' }))
  await next()
}

describe('transfer submission', () => {
  it('revalidates a same-ID reduced balance on Confirm, focuses Amount and sends zero requests', async () => {
    let posts = 0
    server.use(http.post('*/api/transfers', () => { posts++; return fail() }))
    const { client, onClose, rerender } = setup()
    await savedReview()
    rerender(<StrictMode><QueryClientProvider client={client}><TestDialog customer={customer} accounts={accounts.map((account) => account.id === 'checking' ? { ...account, balance: 70 } : account)} onClose={onClose} /></QueryClientProvider></StrictMode>)
    await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
    expect(await screen.findByRole('heading', { name: 'How much?' })).toBeVisible()
    await waitFor(() => expect(screen.getByLabelText('Amount')).toHaveFocus())
    expect(screen.getByText(/Amount can't be more than your available balance/)).toHaveTextContent('70.00')
    expect(posts).toBe(0)
  })

  it('blocks a removed payee at final validation without posting', async () => {
    let posts = 0
    server.use(http.post('*/api/transfers', () => { posts++; return fail() }))
    const { client } = setup()
    await savedReview()
    act(() => client.setQueryData(['payees'], { payees: [] }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
    expect(await screen.findByRole('heading', { name: 'Who are you sending to?' })).toBeVisible()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send to someone new' })).toHaveFocus())
    expect(posts).toBe(0)
  })

  it('guards synchronous repeated submits before validation settles and pending requests, without retrying a failure', async () => {
    let posts = 0
    let finish!: () => void
    const held = new Promise<void>((resolve) => { finish = resolve })
    server.use(http.post('*/api/transfers', async () => { posts++; await held; return fail() }))
    setup(); await savedReview()
    const form = document.getElementById('transfer-form')!
    act(() => { fireEvent.submit(form); fireEvent.submit(form); fireEvent.submit(form) })
    expect(await screen.findByRole('button', { name: 'Sending…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    await waitFor(() => expect(posts).toBe(1))
    fireEvent.submit(form)
    await userEvent.keyboard('{Enter}')
    finish()
    expect(await screen.findByRole('alert')).toHaveTextContent("Something went wrong. Your money hasn't left your account. Try again.")
    expect(posts).toBe(1)
    expect(screen.queryByRole('heading', { name: 'Transfer sent' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Check the details' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Confirm transfer' })).toBeEnabled()
  })

  it('preserves server amount errors across blur and unrelated edits, then clears on correction', async () => {
    server.use(http.post('*/api/transfers', () => HttpResponse.json({ error: { code: 'INSUFFICIENT_FUNDS', message: 'Balance changed.', fields: { amount: 'Use a smaller amount.', 'unknown.field': 'Contact support.' } } }, { status: 422 })))
    setup(); await savedReview()
    await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Balance changed.')
    expect(alert).toHaveTextContent('Contact support.')
    await userEvent.click(screen.getByRole('button', { name: 'Edit amount' }))
    await waitFor(() => expect(screen.getByLabelText('Amount')).toHaveFocus())
    expect(screen.getByLabelText('Amount')).toHaveAttribute('aria-describedby', 'amount-context amount-error')
    await userEvent.click(screen.getByLabelText('Note (optional)'))
    await userEvent.type(screen.getByLabelText('Note (optional)'), 'Unrelated')
    await userEvent.tab()
    expect(screen.getByText('Use a smaller amount.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.clear(screen.getByLabelText('Amount'))
    await userEvent.type(screen.getByLabelText('Amount'), '90')
    await waitFor(() => expect(screen.queryByText('Use a smaller amount.')).not.toBeInTheDocument())
    await next()
    expect(screen.getByRole('heading', { name: 'Check the details' })).toBeVisible()
  })

  it.each(['network', 'invalid JSON'] as const)('shows uncertainty after %s with no success or automatic retry', async (kind) => {
    let posts = 0
    server.use(http.post('*/api/transfers', () => { posts++; return kind === 'network' ? HttpResponse.error() : new HttpResponse('<html>invalid</html>') }))
    setup(); await savedReview()
    await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't confirm whether this transfer completed. Check your dashboard before trying again.")
    expect(screen.queryByRole('heading', { name: 'Transfer sent' })).not.toBeInTheDocument()
    expect(posts).toBe(1)
  })
})

it('revalidates an unchanged server-rejected amount when its from-account changes', async () => {
  server.use(http.post('*/api/transfers', () => HttpResponse.json({ error: { code: 'INSUFFICIENT_FUNDS', message: 'Balance changed.', fields: { amount: 'Choose another account or amount.' } } }, { status: 422 })))
  setup(); await savedReview()
  await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Edit amount' }))
  await userEvent.selectOptions(screen.getByLabelText('From account'), 'savings')
  expect(await screen.findByText(/Amount can't be more than your available balance/)).toHaveTextContent('60.00')
  expect(screen.queryByText('Choose another account or amount.')).not.toBeInTheDocument()
  await userEvent.selectOptions(screen.getByLabelText('From account'), 'checking')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
})

it.each([
  ['recipient.name', 'Recipient name', 'recipientName', false],
  ['recipient.accountNumber', 'Account number (8 digits)', 'accountNumber', false],
  ['recipient.bank', 'Bank', 'bankChoice', false],
  ['recipient.bank', 'Bank name', 'bankName', true],
  ['fromAccountId', 'From account', 'fromAccountId', false],
  ['note', 'Note (optional)', 'note', false],
] as const)('shows and focuses server %s errors using the existing linked %s field', async (path, label, field, otherBank) => {
  server.use(http.post('*/api/transfers', () => HttpResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Check your details.', fields: { [path]: 'Please correct this detail.' } } }, { status: 400 })))
  setup()
  await userEvent.click(screen.getByRole('button', { name: 'Send to someone new' }))
  await userEvent.type(screen.getByLabelText('Recipient name'), 'Alex Lim')
  await userEvent.type(screen.getByLabelText('Account number (8 digits)'), '00123456')
  await userEvent.selectOptions(screen.getByLabelText('Bank'), otherBank ? 'other' : 'OCBC')
  if (otherBank) await userEvent.type(screen.getByLabelText('Bank name'), 'Local Bank')
  await next()
  await userEvent.click(screen.getByRole('button', { name: '50' }))
  await next()
  await userEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }))
  await userEvent.click(await screen.findByRole('button', { name: path.startsWith('recipient.') ? 'Edit recipient' : 'Edit amount' }))
  const input = screen.getByLabelText(label)
  await waitFor(() => expect(input).toHaveFocus())
  expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(input.getAttribute('aria-describedby')).toContain(`${field}-error`)
  await userEvent.tab()
  expect(screen.getByText('Please correct this detail.')).toBeVisible()
})

it('requires complete new-recipient details and updates Continue before the final field blurs', async () => {
  setup()
  const continueButton = screen.getByRole('button', { name: 'Continue' })
  expect(continueButton).toBeDisabled()
  await userEvent.click(await screen.findByRole('radio', { name: /Jamie Tan/ }))
  expect(continueButton).toBeEnabled()
  await userEvent.click(screen.getByRole('button', { name: 'Send to someone new' }))
  expect(continueButton).toBeDisabled()
  await userEvent.type(screen.getByLabelText('Recipient name'), 'Alex Lim')
  expect(continueButton).toBeDisabled()
  await userEvent.type(screen.getByLabelText('Account number (8 digits)'), '00123456')
  expect(continueButton).toBeDisabled()
  await userEvent.selectOptions(screen.getByLabelText('Bank'), 'other')
  expect(continueButton).toBeDisabled()
  await userEvent.type(screen.getByLabelText('Bank name'), 'Local Bank')
  expect(screen.getByLabelText('Bank name')).toHaveFocus()
  expect(continueButton).toBeEnabled()
  await next()
  const amount = screen.getByLabelText('Amount')
  expect(continueButton).toBeDisabled()
  await userEvent.type(amount, '120')
  expect(amount).toHaveFocus()
  expect(continueButton).toBeEnabled()
  await userEvent.selectOptions(screen.getByLabelText('From account'), '')
  expect(continueButton).toBeDisabled()
  await userEvent.selectOptions(screen.getByLabelText('From account'), 'checking')
  expect(continueButton).toBeEnabled()
  await userEvent.clear(amount)
  expect(continueButton).toBeDisabled()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByRole('heading', { name: 'How much?' })).toBeVisible()
})
