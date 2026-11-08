import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import type { Account } from '../../../api/types'
import { formatMoney } from '../../../lib/format'
import { amountFields, type TransferValues } from '../transferSchema'
import { TransferSelectField, TransferFieldError } from './TransferFields'

type Props = {
  accounts: Account[]
  remainingLimit: number
}
export function AmountStep({ accounts, remainingLimit }: Props) {
  const { register, control, setValue } = useFormContext<TransferValues>()
  const { errors } = useFormState({ control, name: amountFields })
  const [accountId, note] = useWatch({ control, name: ['fromAccountId', 'note'] })
  const deposits = accounts.filter((account) => account.type !== 'credit')
  const account = deposits.find((account) => account.id === accountId)
  return <>
    <h3 tabIndex={-1}>How much?</h3>
    {deposits.length === 0 ? <p className="transfer-feedback" role="status">No deposit accounts are available for transfers.</p> : null}
    <TransferSelectField
      name="fromAccountId"
      label="From account"
      disabled={deposits.length === 0}
      hint="Deposit accounts only"
      hintId="account-help"
    >
      <option value="">Choose a deposit account</option>
      {deposits.map((account) => <option key={account.id} value={account.id}>
        {account.name} · {account.maskedNumber}
      </option>)}
    </TransferSelectField>
    <div className="transfer-field">
      <label htmlFor="amount">Amount</label>
      <div className="amount-input">
        <span aria-hidden="true">SGD</span>
        <input
          id="amount"
          {...register('amount')}
          inputMode="decimal"
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={`amount-context${errors.amount ? ' amount-error' : ''}`}
        />
      </div>
      <TransferFieldError name="amount" />
      <div className="amount-presets">
        {[50, 100, 250, 500].map((amount) => <button
          type="button"
          key={amount}
          onClick={() => setValue('amount', amount.toFixed(2), { shouldDirty: true, shouldValidate: true })}
        >
          {amount}
        </button>)}
      </div>
      <div id="amount-context" className="transfer-help">
        {account ? <p>Available {formatMoney(account.balance)}
        </p> : null}
        <p>Remaining daily limit {formatMoney(remainingLimit)}
        </p>
      </div>
    </div>
    <div className="transfer-field">
      <div className="note-label">
        <label htmlFor="note">Note (optional)</label>
        <span id="note-count" aria-live="polite">
          {note.length}/50</span>
      </div>
      <input
        id="note"
        {...register('note')}
        aria-invalid={Boolean(errors.note)}
        aria-describedby={`note-count${errors.note ? ' note-error' : ''}`}
      />
      <TransferFieldError name="note" />
    </div>
  </>
}
