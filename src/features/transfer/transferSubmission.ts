import { apiFetch } from '../../api/client'
import type { CreateTransferRequest, TransferResponse } from '../../api/types'
import { effectiveBank, type TransferValues, type ValidatedTransferValues } from './transferSchema'

export function transferRequest(values: ValidatedTransferValues): CreateTransferRequest {
  return {
    fromAccountId: values.fromAccountId,
    amount: Number(values.amount),
    ...(values.note.trim() ? { note: values.note } : {}),
    ...(values.recipientMode === 'saved' ? { payeeId: values.payeeId } : {
      recipient: { name: values.recipientName.trim(), accountNumber: values.accountNumber.trim(), bank: effectiveBank(values) },
    }),
  }
}

export function createTransfer(request: CreateTransferRequest): Promise<TransferResponse> {
  return apiFetch<TransferResponse>('/api/transfers', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request),
  })
}

export function mapTransferField(path: string, values: TransferValues): keyof TransferValues | undefined {
  switch (path) {
    case 'fromAccountId': case 'payeeId': case 'amount': case 'note': return path
    case 'recipient.name': return 'recipientName'
    case 'recipient.accountNumber': return 'accountNumber'
    case 'recipient.bank': return values.bankChoice === 'other' ? 'bankName' : 'bankChoice'
    default: return undefined
  }
}
