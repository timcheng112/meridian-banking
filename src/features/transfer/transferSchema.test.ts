import { describe, expect, it } from 'vitest'
import type { Account } from '../../api/types'
import { createTransferSchema, effectiveBank, type TransferValues } from './transferSchema'
const account: Account = { id: 'a', name: 'Checking', type: 'checking', maskedNumber: '•••• 1234', balance: 100, currency: 'SGD' }
const valid: TransferValues = { recipientMode: 'new', payeeId: '', recipientName: 'Alex', accountNumber: '00123456', bankChoice: 'DBS', bankName: '', fromAccountId: 'a', amount: '1.00', note: '' }
const schema = createTransferSchema({ accounts: [account], payees: [], remainingLimit: 80 })
const errors = (values: Partial<TransferValues>) => schema.safeParse({ ...valid, ...values }).error?.flatten().fieldErrors

describe('transfer validation', () => {
  it.each(['', '0', '0.99', '1.001', '1e2', '+1', '-1', '1,000', 'Infinity', '9'.repeat(400)])('rejects invalid amount %s', (amount) => { expect(errors({ amount })?.amount).toBeDefined() })
  it.each(['1', '1.00', '80.00'])('accepts valid amount %s', (amount) => { expect(schema.safeParse({ ...valid, amount }).success).toBe(true) })
  it('checks exact monetary boundaries and current context', () => {
    expect(errors({ amount: '80.01' })?.amount?.[0]).toContain('remaining daily limit')
    expect(errors({ amount: '100.01' })?.amount?.[0]).toContain('available balance')
    expect(createTransferSchema({ accounts: [{ ...account, balance: 1 }], payees: [], remainingLimit: 80 }).safeParse({ ...valid, amount: '1.01' }).success).toBe(false)
    expect(errors({ fromAccountId: 'missing' })?.fromAccountId).toBeDefined()
    expect(createTransferSchema({ accounts: [{ ...account, type: 'credit' }], payees: [], remainingLimit: 80 }).safeParse(valid).success).toBe(false)
  })
  it.each([1, 2, 50, 51])('checks name length %i', (length) => { expect(Boolean(errors({ recipientName: 'x'.repeat(length) })?.recipientName)).toBe(length < 2 || length > 50) })
  it.each(['1234567', '123456789', 'abcdefgh', '１２３４５６７８'])('rejects account %s', (accountNumber) => { expect(errors({ accountNumber })?.accountNumber).toBeDefined() })
  it('validates actual Other bank and preserves leading zeroes', () => {
    expect(schema.parse(valid).accountNumber).toBe('00123456')
    expect(errors({ bankChoice: '' })?.bankChoice).toBeDefined()
    for (const length of [0, 1, 2, 30, 31]) expect(Boolean(errors({ bankChoice: 'other', bankName: 'x'.repeat(length) })?.bankName)).toBe(length < 2 || length > 30)
    expect(effectiveBank({ ...valid, bankChoice: 'other', bankName: '  Local Bank  ' })).toBe('Local Bank')
    expect(effectiveBank({ ...valid, bankName: 'Local Bank' })).toBe('DBS')
  })
  it('validates only the active recipient and keeps recipient issues when amount is blank', () => {
    const savedSchema = createTransferSchema({ accounts: [account], payees: [{ id: 'p', name: 'Payee', bank: 'DBS', accountNumberMasked: '•••• 1111', initials: 'P', lastUsedAt: '' }], remainingLimit: 80 })
    expect(savedSchema.safeParse({ ...valid, recipientMode: 'saved', payeeId: 'p', recipientName: '', accountNumber: '', bankChoice: '' }).success).toBe(true)
    expect(errors({ recipientName: '', amount: '' })?.recipientName).toBeDefined()
    expect(errors({ recipientMode: 'saved', payeeId: 'missing' })?.payeeId).toBeDefined()
    expect(errors({ note: 'x'.repeat(50) })).toBeUndefined()
    expect(errors({ note: 'x'.repeat(51) })?.note).toBeDefined()
  })
})
