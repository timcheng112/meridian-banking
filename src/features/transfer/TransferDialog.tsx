import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { Account, Customer } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { payeesQuery } from './queries'
import { amountFields, createTransferSchema, recipientFields, type TransferStep, type TransferValues } from './transferSchema'
import { TransferDialogShell } from './components/TransferDialogShell'
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
  const [step, setStep] = useState<TransferStep>('recipient')
  const query = useQuery(payeesQuery)
  const payees = query.data?.payees ?? []
  const remainingLimit = customer.dailyTransferLimit - customer.transferredToday
  const form = useForm<TransferValues>({
    resolver: zodResolver(createTransferSchema({ accounts, payees, remainingLimit })),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    shouldUnregister: false,
    defaultValues: {
      recipientMode: 'saved',
      payeeId: '',
      recipientName: '',
      accountNumber: '',
      bankChoice: '',
      bankName: '',
      fromAccountId: (accounts.find((account) => account.type === 'checking') ?? accounts.find((account) => account.type === 'savings'))?.id ?? '',
      amount: '',
      note: '',
    },
  })
  const { register, setValue, control, trigger, getValues, getFieldState, setFocus, formState: { errors } } = form
  const [mode, selectedId, bankChoice, accountId] = useWatch({ control, name: ['recipientMode', 'payeeId', 'bankChoice', 'fromAccountId'] })
  const selectedAccount = accounts.find((account) => account.id === accountId && account.type !== 'credit')
  const availableBalance = selectedAccount?.balance
  useEffect(() => {
    if (getValues('amount').trim()) void trigger('amount')
  }, [accountId, availableBalance, remainingLimit, trigger, getValues])

  async function advance() {
    if (step === 'review') return
    if (step === 'amount' && !await trigger(recipientFields(mode))) {
      setStep('recipient')
      requestAnimationFrame(() => {
        const first = recipientFields(mode).find((path) => getFieldState(path).invalid)
        if (first === 'payeeId') (document.querySelector<HTMLElement>('.transfer-dialog input[type="radio"]') ?? document.getElementById('new-recipient-toggle'))?.focus()
        else if (first) setFocus(first)
      })
      return
    }
    const paths = step === 'recipient' ? recipientFields(mode) : amountFields
    if (await trigger(paths)) {
      setStep(step === 'recipient' ? 'amount' : 'review')
      return
    }
    const first = paths.find((path) => getFieldState(path).invalid)
    if (first === 'payeeId') {
      const target = document.querySelector<HTMLElement>('.transfer-dialog input[type="radio"]') ?? document.getElementById('new-recipient-toggle')
      target?.focus()
    } else if (first) setFocus(first)
  }
  return <TransferDialogShell
    step={step}
    onClose={onClose}
    footer={<>
      {step === 'review' ? <p className="preview-notice">Transfers are unavailable in this preview.</p> : null}
      <div className="transfer-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={step === 'recipient' ? onClose : () => setStep(step === 'review' ? 'amount' : 'recipient')}
        >
          {step === 'recipient' ? 'Cancel' : 'Back'}
        </Button>
        {step === 'review' ? <Button type="button" disabled>Confirm transfer</Button> : <Button
          type="submit"
          form="transfer-form"
          disabled={step === 'amount' && !accounts.some((account) => account.type !== 'credit')}
        >Continue</Button>}
      </div>
    </>}
  >
    <form
      id="transfer-form"
      noValidate
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.type !== 'radio') {
          event.preventDefault()
          void advance()
        }
      }}
      onSubmit={(event) => { event.preventDefault(); void advance() }}
    >
      {step === 'recipient' ? <RecipientStep
        payees={payees}
        isPending={query.isPending}
        isError={query.isError || (query.isFetching && query.errorUpdatedAt > 0)}
        isFetching={query.isFetching}
        hasData={query.data !== undefined}
        retry={() => { void query.refetch() }}
        register={register}
        setValue={setValue}
        errors={errors}
        mode={mode}
        selectedId={selectedId}
        bankChoice={bankChoice}
      /> : step === 'amount' ? <AmountStep
        accounts={accounts}
        remainingLimit={remainingLimit}
        register={register}
        control={control}
        setValue={setValue}
        errors={errors}
      /> : <ReviewStep
        values={getValues()}
        accounts={accounts}
        payees={payees}
      />}
    </form>
  </TransferDialogShell>
}
