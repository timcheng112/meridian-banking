import type { Account, Payee } from '../../../api/types'
import { formatMoney } from '../../../lib/format'
import { effectiveBank, type TransferValues } from '../transferSchema'

type Props = {
  values: TransferValues
  accounts: Account[]
  payees: Payee[]
}
export function ReviewStep({ values, accounts, payees }: Props) {
  const account = accounts.find((account) => account.id === values.fromAccountId && account.type !== 'credit')
  const saved = payees.find((payee) => payee.id === values.payeeId)
  const recipient = values.recipientMode === 'saved' ? saved : { name: values.recipientName.trim(), bank: effectiveBank(values), accountNumberMasked: `•••• ${values.accountNumber.trim().slice(-4)}` }
  const amount = Number(values.amount)
  return <>
    <h3 tabIndex={-1}>Check the details</h3>
    <dl className="transfer-review">
      <div>
        <dt>From</dt>
        <dd>
          <strong>
            {account?.name ?? 'Account unavailable'}
          </strong>
          <span>
            {account?.maskedNumber}
          </span>
        </dd>
      </div>
      <div>
        <dt>To</dt>
        <dd>
          <strong>
            {recipient?.name ?? 'Recipient unavailable'}
          </strong>
          <span>
            {recipient ? `${recipient.bank} · ${recipient.accountNumberMasked}` : ''}
          </span>
        </dd>
      </div>
      <div>
        <dt>Amount</dt>
        <dd className="amount">
          {formatMoney(amount)}
        </dd>
      </div>
      <div>
        <dt>Fee</dt>
        <dd className="amount">
          {formatMoney(0)}
        </dd>
      </div>
      <div>
        <dt>Note</dt>
        <dd>
          {values.note || 'None'}
        </dd>
      </div>
      <div className="review-total">
        <dt>Total</dt>
        <dd className="amount">
          {formatMoney(amount)}
        </dd>
      </div>
    </dl>
    <p className="transfer-arrival">Usually arrives in minutes.</p>
  </>
}
