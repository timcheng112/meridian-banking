import { FormProvider } from 'react-hook-form'
import type { Account, Customer } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { useTransferForm } from './useTransferForm'
import type { TransferSubmission } from './useTransferSubmission'
import { TransferDialogShell } from './components/TransferDialogShell'
import { TransferFooter } from './components/TransferFooter'
import { RecipientStep } from './components/RecipientStep'
import { AmountStep } from './components/AmountStep'
import { ReviewStep } from './components/ReviewStep'
import { SuccessPanel } from './components/SuccessPanel'
import { TransferSubmissionFeedback } from './components/TransferSubmissionFeedback'
import './transfer.css'

type Props = {
  customer: Customer
  accounts: Account[]
  visible: boolean
  submission: TransferSubmission
  onClose: () => void
  onInvalid: () => void
}
export function TransferDialog({ customer, accounts, visible, submission, onClose, onInvalid }: Props) {
  const transfer = useTransferForm({ customer, accounts, visible, submission, onInvalid })
  const receipt = submission.receipt
  return <FormProvider {...transfer.form}>
    <TransferDialogShell
      visible={visible}
      view={receipt ? 'success' : transfer.step}
      onClose={onClose}
      footer={receipt ? (
        <div className="transfer-actions success-actions">
          <Button type="button" disabled={submission.refreshStatus === 'refreshing'} onClick={onClose}>
            Back to dashboard
          </Button>
        </div>
      ) : <TransferFooter
        step={transfer.step}
        busy={transfer.busy}
        continueDisabled={transfer.continueDisabled}
        onBack={transfer.back}
        onClose={onClose}
      />}
    >
      <div className="sr-only" aria-live="polite">
        {receipt ? 'Transfer sent' : transfer.busy ? 'Sending transfer…' : ''}
      </div>
      {receipt ? <SuccessPanel
        receipt={receipt}
        refreshStatus={submission.refreshStatus}
        onRetry={() => { void submission.refresh() }}
      /> : <form id="transfer-form" noValidate {...transfer.formEvents}>
        {submission.error && transfer.step === 'review' ? <TransferSubmissionFeedback
          error={submission.error}
          values={transfer.form.getValues()}
          visible={visible}
          onEdit={transfer.editErrors}
        /> : null}
        <fieldset className="transfer-form-fields" disabled={transfer.busy}>
          {transfer.step === 'recipient' ? <RecipientStep
            query={transfer.payeesQuery}
          /> : transfer.step === 'amount' ? <AmountStep
            accounts={accounts}
            remainingLimit={transfer.remainingLimit}
          /> : <ReviewStep
            values={transfer.form.getValues()}
            accounts={accounts}
            payees={transfer.payees}
          />}
        </fieldset>
      </form>}
    </TransferDialogShell>
  </FormProvider>
}
