import { useLayoutEffect, useRef } from 'react'
import { ApiError } from '../../../api/client'
import { Button } from '../../../components/ui/Button'
import { mapTransferField } from '../transferSubmission'
import { amountFields, type TransferValues } from '../transferSchema'

const fieldLabels: Partial<Record<keyof TransferValues, string>> = {
  fromAccountId: 'From account',
  payeeId: 'Recipient',
  recipientName: 'Recipient name',
  accountNumber: 'Account number',
  bankChoice: 'Bank',
  bankName: 'Bank name',
  amount: 'Amount',
  note: 'Note',
}
const generic = "Something went wrong. Your money hasn't left your account. Try again."
export function TransferSubmissionFeedback({ error, values, visible, onEdit }: {
  error: Error
  values: TransferValues
  visible: boolean
  onEdit: (step: 'recipient' | 'amount') => void
}) {
  const alert = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => { if (visible) alert.current?.focus() }, [error, visible])
  const fields = error instanceof ApiError ? Object.entries(error.fields ?? {}) : []
  const mapped = fields.map(([path]) => mapTransferField(path, values)).filter((path) => path !== undefined)
  return <div className="transfer-feedback transfer-send-error" role="alert" tabIndex={-1} ref={alert}>
    <p>{error instanceof ApiError ? generic : "We couldn't confirm whether this transfer completed. Check your dashboard before trying again."}</p>
    {error instanceof ApiError && !generic.includes(error.message) ? <p>{error.message}</p> : null}
    {fields.length ? <>
      <p>Check these details:</p>
      <ul>{fields.map(([path, message]) => {
        const field = mapTransferField(path, values)
        return <li key={path}>{field ? `${fieldLabels[field]}: ` : ''}{message}</li>
      })}</ul>
    </> : null}
    {mapped.some((path) => !amountFields.includes(path)) ? <Button type="button" variant="secondary" onClick={() => onEdit('recipient')}>Edit recipient</Button> : null}
    {mapped.some((path) => amountFields.includes(path)) ? <Button type="button" variant="secondary" onClick={() => onEdit('amount')}>Edit amount</Button> : null}
  </div>
}
