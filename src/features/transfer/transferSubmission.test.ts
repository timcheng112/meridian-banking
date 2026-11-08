import { describe, expect, it } from 'vitest'
import { mapTransferField, transferRequest } from './transferSubmission'
import type { TransferValues } from './transferSchema'

const values: TransferValues = { recipientMode: 'saved', payeeId: 'pay_001', recipientName: ' Alex Lim ', accountNumber: ' 00123456 ', bankChoice: 'other', bankName: ' Local Bank ', fromAccountId: 'acc_checking', amount: '120.00', note: '' }
describe('transfer request boundary', () => {
  it('sends only the saved identifier and omits an empty note', () => {
    expect(transferRequest(values)).toEqual({ fromAccountId: 'acc_checking', amount: 120, payeeId: 'pay_001' })
  })
  it('trims a new recipient while preserving leading zeros and nonempty note content', () => {
    expect(transferRequest({ ...values, recipientMode: 'new', note: ' Dinner ' })).toEqual({ fromAccountId: 'acc_checking', amount: 120, note: ' Dinner ', recipient: { name: 'Alex Lim', accountNumber: '00123456', bank: 'Local Bank' } })
  })
  it('whitelists server paths and maps both bank variants', () => {
    expect(mapTransferField('recipient.bank', values)).toBe('bankName')
    expect(mapTransferField('recipient.bank', { ...values, bankChoice: 'DBS' })).toBe('bankChoice')
    expect(mapTransferField('__proto__', values)).toBeUndefined()
    expect(mapTransferField('recipient.accountNumber', values)).toBe('accountNumber')
  })
})
