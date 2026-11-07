import { useWatch, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'
import type { Account } from '../../../api/types'
import { formatMoney } from '../../../lib/format'
import type { TransferValues } from '../transferSchema'

type Props = {
  accounts: Account[]
  remainingLimit: number
  register: UseFormRegister<TransferValues>
  control: Control<TransferValues>
  setValue: UseFormSetValue<TransferValues>
  errors: FieldErrors<TransferValues>
}
export function AmountStep({ accounts, remainingLimit, register, control, setValue, errors }: Props) {
  const [accountId, note] = useWatch({ control, name: ['fromAccountId', 'note'] })
  const deposits = accounts.filter((account) => account.type !== 'credit')
  const account = deposits.find((account) => account.id === accountId)
  return <>
    <h3 tabIndex={-1}>How much?</h3>
    {deposits.length === 0 ? <p className="transfer-feedback" role="status">No deposit accounts are available for transfers.</p> : null}
    <div className="transfer-field">
      <label htmlFor="fromAccountId">From account</label>
      <div className="transfer-select">
        <select
          id="fromAccountId"
          {...register('fromAccountId')}
          disabled={deposits.length === 0}
          aria-invalid={Boolean(errors.fromAccountId)}
          aria-describedby={`account-help${errors.fromAccountId ? ' fromAccountId-error' : ''}`}
        >
          <option value="">Choose a deposit account</option>
          {deposits.map((account) => <option key={account.id} value={account.id}>
            {account.name} · {account.maskedNumber}
          </option>)}
        </select>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m3 6 5 5 5-5" />
        </svg>
      </div>
      <p id="account-help" className="transfer-help">Deposit accounts only</p>
      {errors.fromAccountId ? <p
        id="fromAccountId-error"
        className="transfer-error"
        aria-live="polite"
      >
        {errors.fromAccountId.message}
      </p> : null}
    </div>
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
      {errors.amount ? <p
        id="amount-error"
        className="transfer-error"
        aria-live="polite"
      >
        {errors.amount.message}
      </p> : null}
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
      {errors.note ? <p
        id="note-error"
        className="transfer-error"
        aria-live="polite"
      >
        {errors.note.message}
      </p> : null}
    </div>
  </>
}
