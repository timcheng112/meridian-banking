import type { ComponentProps, ReactNode } from 'react'
import { useFormContext, useFormState } from 'react-hook-form'
import type { TransferValues } from '../transferSchema'

type TextFieldName = 'recipientName' | 'accountNumber' | 'bankName'
type SelectFieldName = 'bankChoice' | 'fromAccountId'

export function TransferFieldError({ name }: { name: keyof TransferValues }) {
  const { control } = useFormContext<TransferValues>()
  const { errors } = useFormState({ control, name })
  return errors[name] ? <p
    id={`${name}-error`}
    className="transfer-error"
    aria-live="polite"
  >
    {errors[name]?.message}
  </p> : null
}

export function TransferTextField({ name, label, inputMode }: {
  name: TextFieldName
  label: string
  inputMode?: ComponentProps<'input'>['inputMode']
}) {
  const { register, control } = useFormContext<TransferValues>()
  const { errors } = useFormState({ control, name })
  return <div className="transfer-field">
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      {...register(name)}
      inputMode={inputMode}
      aria-invalid={Boolean(errors[name])}
      aria-describedby={errors[name] ? `${name}-error` : undefined}
    />
    <TransferFieldError name={name} />
  </div>
}

export function TransferSelectField({ name, label, disabled, hint, hintId, children }: {
  name: SelectFieldName
  label: string
  disabled?: boolean
  hint?: string
  hintId?: string
  children: ReactNode
}) {
  const { register, control } = useFormContext<TransferValues>()
  const { errors } = useFormState({ control, name })
  const describedBy = [hintId, errors[name] ? `${name}-error` : undefined].filter(Boolean).join(' ') || undefined
  return <div className="transfer-field">
    <label htmlFor={name}>{label}</label>
    <div className="transfer-select">
      <select
        id={name}
        {...register(name)}
        disabled={disabled}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={describedBy}
      >
        {children}
      </select>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="m3 6 5 5 5-5" />
      </svg>
    </div>
    {hint ? <p id={hintId} className="transfer-help">{hint}</p> : null}
    <TransferFieldError name={name} />
  </div>
}
