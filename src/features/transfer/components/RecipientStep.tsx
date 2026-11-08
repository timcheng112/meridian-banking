import { useRef, useState } from 'react'
import { useController, useFormContext, useFormState, useWatch } from 'react-hook-form'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PayeesResponse } from '../../../api/types'
import { Button } from '../../../components/ui/Button'
import { SearchInput } from '../../../components/ui/SearchInput'
import { Skeleton } from '../../../components/ui/Skeleton'
import type { TransferValues } from '../transferSchema'
import { TransferTextField, TransferSelectField, TransferFieldError } from './TransferFields'

type Props = {
  query: UseQueryResult<PayeesResponse, Error>
}
export function RecipientStep({ query }: Props) {
  const { control, setValue } = useFormContext<TransferValues>()
  const [mode, selectedId, bankChoice] = useWatch({ control, name: ['recipientMode', 'payeeId', 'bankChoice'] })
  const { errors } = useFormState({ control, name: 'payeeId' })
  const payees = query.data?.payees ?? []
  const hasData = query.data !== undefined
  const isError = query.isError || (query.isFetching && query.errorUpdatedAt > 0)
  const { field: payeeField } = useController({ name: 'payeeId', control })
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const term = search.trim().toLowerCase()
  const filtered = payees.filter((payee) => `${payee.name} ${payee.bank}`.toLowerCase().includes(term))
  const selected = payees.find((payee) => payee.id === selectedId)
  return <>
    <h3 tabIndex={-1}>Who are you sending to?</h3>
    <label className="payee-search-label" htmlFor="payee-search">Search payees</label>
    <SearchInput
      id="payee-search"
      ref={searchRef}
      aria-label="Search payees"
      placeholder="Search payees"
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      disabled={!hasData || payees.length === 0}
    />
    {query.isPending ? <div className="payee-loading" role="status">
      <p>Loading payees…</p>
      {[0, 1, 2, 3].map((item) => <Skeleton key={item} kind="value" className="payee-skeleton" />)}
    </div> : null}
    {isError ? <div className="transfer-feedback" role="alert">
      <p>
        {hasData ? "We couldn't refresh your payees. Showing previously loaded payees." : "We couldn't load your payees."}
      </p>
      <Button
        type="button"
        variant="secondary"
        onClick={() => { void query.refetch() }}
        disabled={query.isFetching}
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
          name={payeeField.name}
          ref={payeeField.ref}
          onBlur={payeeField.onBlur}
          type="radio"
          value={payee.id}
          checked={mode === 'saved' && selectedId === payee.id}
          onChange={() => { setValue('recipientMode', 'saved'); payeeField.onChange(payee.id) }}
          aria-invalid={Boolean(errors.payeeId)}
          aria-describedby={errors.payeeId ? 'payeeId-error' : undefined}
        />
        <span className="payee-identity">
          <strong>
            {payee.name}
          </strong>
          <span>
            {payee.bank} · {payee.accountNumberMasked}
          </span>
        </span>
      </label>)}{payees.length === 0 ? <p className="payee-empty">No saved payees.</p> : filtered.length === 0 ? <div className="payee-empty">
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
    {mode === 'saved' ? <TransferFieldError name="payeeId" /> : null}
    <button
      id="new-recipient-toggle"
      type="button"
      className="new-recipient-toggle"
      aria-expanded={mode === 'new'}
      aria-controls="new-recipient-fields"
      aria-labelledby="new-recipient-label"
      aria-describedby="new-recipient-help"
      onClick={() => setValue('recipientMode', mode === 'new' ? 'saved' : 'new')}
    >
      <span className="new-recipient-indicator" aria-hidden="true" />
      <span className="payee-identity">
        <strong id="new-recipient-label">Send to someone new</strong>
        <span id="new-recipient-help">Enter their details below</span>
      </span>
    </button>
    {mode === 'new' ? <div id="new-recipient-fields" className="new-recipient-fields">
      <TransferTextField name="recipientName" label="Recipient name" />
      <TransferTextField name="accountNumber" label="Account number (8 digits)" inputMode="numeric" />
      <TransferSelectField name="bankChoice" label="Bank">
        <option value="">Choose a bank</option>
        {['DBS', 'OCBC', 'UOB', 'POSB'].map((bank) => <option key={bank}>
          {bank}
        </option>)}
        <option value="other">Other bank</option>
      </TransferSelectField>
      {bankChoice === 'other' ? <TransferTextField name="bankName" label="Bank name" /> : null}
    </div> : null}
  </>
}
