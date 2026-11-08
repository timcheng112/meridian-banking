import { z } from 'zod'
import type { Account, Payee } from '../../api/types'
import { formatMoney } from '../../lib/format'

const fields = z.object({
  recipientMode: z.enum(['saved', 'new']),
  payeeId: z.string(),
  recipientName: z.string(),
  accountNumber: z.string(),
  bankChoice: z.string(),
  bankName: z.string(),
  fromAccountId: z.string(),
  amount: z.string(),
  note: z.string(),
})

export type TransferValues = z.infer<typeof fields>
export type TransferStep = 'recipient' | 'amount' | 'review'
export const recipientFields = (mode: TransferValues['recipientMode']): (keyof TransferValues)[] => mode === 'saved'
  ? ['payeeId'] : ['recipientName', 'accountNumber', 'bankChoice', 'bankName']
export const amountFields: (keyof TransferValues)[] = ['fromAccountId', 'amount', 'note']
export const effectiveBank = (values: TransferValues) => (values.bankChoice === 'other' ? values.bankName : values.bankChoice).trim()

export function createTransferSchema({ accounts, payees, remainingLimit }: { accounts: Account[]; payees: Payee[]; remainingLimit: number }) {
  return fields.superRefine((values, ctx) => {
    const error = (path: keyof TransferValues, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })
    if (values.recipientMode === 'saved') {
      if (!payees.some((payee) => payee.id === values.payeeId)) error('payeeId', 'Choose a recipient.')
    } else {
      const name = values.recipientName.trim()
      if (name.length < 2 || name.length > 50) error('recipientName', 'Enter a recipient name between 2 and 50 characters.')
      if (!/^[0-9]{8}$/.test(values.accountNumber.trim())) error('accountNumber', 'Enter a valid 8-digit account number.')
      const bank = effectiveBank(values)
      if (!values.bankChoice) error('bankChoice', 'Choose a bank.')
      else if (bank.length < 2 || bank.length > 30) error(values.bankChoice === 'other' ? 'bankName' : 'bankChoice', 'Enter a bank name between 2 and 30 characters.')
    }
    const account = accounts.find((account) => account.id === values.fromAccountId && account.type !== 'credit')
    if (!account) error('fromAccountId', 'Choose a deposit account.')
    const amountText = values.amount.trim()
    const amount = Number(amountText)
    if (!amountText) error('amount', 'Enter an amount.')
    else if (!/^[0-9]+(?:\.[0-9]{1,2})?$/.test(amountText) || !Number.isFinite(amount) || !Number.isSafeInteger(Math.round(amount * 100))) error('amount', 'Enter an amount with up to 2 decimal places.')
    else if (amount < 1) error('amount', 'Enter an amount of at least SGD 1.00.')
    else if (account && Math.round(amount * 100) > Math.round(account.balance * 100)) error('amount', `Amount can't be more than your available balance (${formatMoney(account.balance)}).`)
    else if (Math.round(amount * 100) > Math.round(remainingLimit * 100)) error('amount', `This transfer exceeds your remaining daily limit (${formatMoney(remainingLimit)}).`)
    if (values.note.length > 50) error('note', 'Keep the note to 50 characters or fewer.')
  })
}

export type ValidatedTransferValues = z.output<ReturnType<typeof createTransferSchema>>
