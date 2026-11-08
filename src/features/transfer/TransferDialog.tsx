import { FormProvider } from 'react-hook-form'
import type { Account, Customer } from '../../api/types'
import { useTransferForm } from './useTransferForm'
import { TransferDialogShell } from './components/TransferDialogShell'
import { TransferFooter } from './components/TransferFooter'
import { RecipientStep } from './components/RecipientStep'
import { AmountStep } from './components/AmountStep'
import { ReviewStep } from './components/ReviewStep'
import './transfer.css'

type Props = {
  customer: Customer
  accounts: Account[]
  onClose: () => void
}
export function TransferDialog({ customer, accounts, onClose }: Props) {
  const transfer = useTransferForm({ customer, accounts })
  return <FormProvider {...transfer.form}>
    <TransferDialogShell
      step={transfer.step}
      onClose={onClose}
      footer={<TransferFooter
        step={transfer.step}
        continueDisabled={transfer.continueDisabled}
        onBack={transfer.back}
        onClose={onClose}
      />}
    >
      <form id="transfer-form" noValidate {...transfer.formEvents}>
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
      </form>
    </TransferDialogShell>
  </FormProvider>
}
