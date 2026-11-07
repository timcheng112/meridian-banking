import { useRef, useState } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import type { Payee } from '../../../api/types'
import { Button } from '../../../components/ui/Button'
import { SearchInput } from '../../../components/ui/SearchInput'
import { Skeleton } from '../../../components/ui/Skeleton'
import type { TransferValues } from '../transferSchema'

type Props = {
  payees: Payee[]
  isPending: boolean
  isError: boolean
  isFetching: boolean
  hasData: boolean
  retry: () => void
  register: UseFormRegister<TransferValues>
  setValue: UseFormSetValue<TransferValues>
  errors: FieldErrors<TransferValues>
  mode: TransferValues['recipientMode']
  selectedId: string
  bankChoice: string
}
export function RecipientStep({ payees, isPending, isError, isFetching, hasData, retry, register, setValue, errors, mode, selectedId, bankChoice }: Props) {
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const term = search.trim().toLowerCase()
  const filtered = payees.filter((payee) => `${payee.name} ${payee.bank}`.toLowerCase().includes(term))
  const selected = payees.find((payee) => payee.id === selectedId)
  const field = (name: 'recipientName' | 'accountNumber' | 'bankName', label: string) => <div className="transfer-field">
    <label htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      {...register(name)}
      inputMode={name === 'accountNumber' ? 'numeric' : undefined}
      aria-invalid={Boolean(errors[name])}
      aria-describedby={errors[name] ? `${name}-error` : undefined}
    />
    {errors[name] ? <p
      id={`${name}-error`}
      className="transfer-error"
      aria-live="polite"
    >
      {errors[name]?.message}
    </p> : null}
  </div>
  return <>
    <h3 tabIndex={-1}>Who are you sending to?</h3>
    <SearchInput
      ref={searchRef}
      aria-label="Search payees"
      placeholder="Search payees"
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      disabled={!hasData || payees.length === 0}
    />
    {isPending ? <div role="status">
      <p>Loading payees…</p>
      {[0, 1, 2, 3].map((item) => <Skeleton key={item} kind="value" />)}
    </div> : null}
    {isError ? <div className="transfer-feedback" role="alert">
      <p>
        {hasData ? "We couldn't refresh your payees. Showing previously loaded payees." : "We couldn't load your payees."}
      </p>
      <Button
        type="button"
        variant="secondary"
        onClick={retry}
        disabled={isFetching}
      >Retry</Button>
    </div> : null}
    {hasData ? <fieldset className="payee-list">
      <legend className="sr-only">Saved recipients</legend>
      {filtered.map((payee) => <label
        key={payee.id}
        className="payee-row"
        data-selected={mode === 'saved' && selectedId === payee.id}
      >
        <input
          {...register('payeeId')}
          type="radio"
          value={payee.id}
          checked={mode === 'saved' && selectedId === payee.id}
          onChange={(event) => { void register('payeeId').onChange(event); setValue('recipientMode', 'saved') }}
          aria-invalid={Boolean(errors.payeeId)}
          aria-describedby={errors.payeeId ? 'payeeId-error' : undefined}
        />
        <span className="payee-avatar" aria-hidden="true">
          {payee.initials}
        </span>
        <span className="payee-identity">
          <strong>
            {payee.name}
          </strong>
          <span>
            {payee.bank} · {payee.accountNumberMasked}
          </span>
        </span>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m6 3 5 5-5 5" />
        </svg>
      </label>)}{payees.length === 0 ? <p>No saved payees.</p> : filtered.length === 0 ? <div>
        <p>No payees match your search.</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => { setSearch(''); searchRef.current?.focus() }}
        >Clear search</Button>
      </div> : null}
    </fieldset> : null}
    {mode === 'saved' && selected && !filtered.includes(selected) ? <p className="transfer-help">Selected: {selected.name}
    </p> : null}
    {errors.payeeId && mode === 'saved' ? <p
      id="payeeId-error"
      className="transfer-error"
      aria-live="polite"
    >
      {errors.payeeId.message}
    </p> : null}
    <button
      id="new-recipient-toggle"
      type="button"
      className="new-recipient-toggle"
      aria-expanded={mode === 'new'}
      aria-controls="new-recipient-fields"
      onClick={() => setValue('recipientMode', mode === 'new' ? 'saved' : 'new')}
    >
      <span aria-hidden="true">+</span> Send to someone new<svg viewBox="0 0 16 16" aria-hidden="true">
        <path d={mode === 'new' ? 'm3 10 5-5 5 5' : 'm3 6 5 5 5-5'} />
      </svg>
    </button>
    {mode === 'new' ? <div id="new-recipient-fields" className="new-recipient-fields">
      {field('recipientName', 'Recipient name')}
      {field('accountNumber', 'Account number (8 digits)')}
      <div className="transfer-field">
        <label htmlFor="bankChoice">Bank</label>
        <select
          id="bankChoice"
          {...register('bankChoice')}
          aria-invalid={Boolean(errors.bankChoice)}
          aria-describedby={errors.bankChoice ? 'bankChoice-error' : undefined}
        >
          <option value="">Choose a bank</option>
          {['DBS', 'OCBC', 'UOB', 'POSB'].map((bank) => <option key={bank}>
            {bank}
          </option>)}
          <option value="other">Other bank</option>
        </select>
        {errors.bankChoice ? <p
          id="bankChoice-error"
          className="transfer-error"
          aria-live="polite"
        >
          {errors.bankChoice.message}
        </p> : null}
      </div>
      {bankChoice === 'other' ? field('bankName', 'Bank name') : null}
    </div> : null}
  </>
}
