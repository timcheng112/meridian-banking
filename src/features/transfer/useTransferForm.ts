import { useEffect, useState, type ComponentProps } from 'react'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFormState, useWatch } from 'react-hook-form'
import type { Account, Customer } from '../../api/types'
import { payeesQuery } from './queries'
import { amountFields, createTransferSchema, recipientFields, type TransferStep, type TransferValues } from './transferSchema'

export function useTransferForm({ customer, accounts }: { customer: Customer; accounts: Account[] }) {
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
  const { control, trigger, getValues, getFieldState, setFocus } = form
  const [mode, bankChoice, accountId] = useWatch({ control, name: ['recipientMode', 'bankChoice', 'fromAccountId'] })
  const selectedAccount = accounts.find((account) => account.id === accountId && account.type !== 'credit')
  const availableBalance = selectedAccount?.balance
  useEffect(() => {
    if (getValues('amount').trim()) void trigger('amount')
  }, [accountId, availableBalance, remainingLimit, trigger, getValues])

  const activeRecipientFields = recipientFields(mode).filter((path) => path !== 'bankName' || bankChoice === 'other')
  const activeFields = step === 'recipient' ? activeRecipientFields : amountFields
  const { errors } = useFormState({ control, name: activeFields })
  const continueDisabled = step !== 'review' && (
    activeFields.some((path) => Boolean(errors[path])) ||
    (step === 'amount' && !accounts.some((account) => account.type !== 'credit'))
  )

  async function advance() {
    if (step === 'review' || continueDisabled) return
    if (step === 'amount' && !await trigger(recipientFields(mode))) {
      setStep('recipient')
      requestAnimationFrame(() => focusFirstInvalid(recipientFields(mode)))
      return
    }
    const paths = step === 'recipient' ? recipientFields(mode) : amountFields
    if (await trigger(paths)) {
      setStep(step === 'recipient' ? 'amount' : 'review')
      return
    }
    focusFirstInvalid(paths)
  }

  function focusFirstInvalid(paths: (keyof TransferValues)[]) {
    const first = paths.find((path) => getFieldState(path).invalid)
    if (first === 'payeeId') {
      const target = document.querySelector<HTMLElement>('.transfer-dialog input[type="radio"]') ?? document.getElementById('new-recipient-toggle')
      target?.focus()
    } else if (first) setFocus(first)
  }

  const formEvents: Pick<ComponentProps<'form'>, 'onChange' | 'onKeyDown' | 'onSubmit'> = {
    onChange(event) {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
        const name = target.name as keyof TransferValues
        if (getFieldState(name).invalid) void trigger(name)
      }
    },
    onKeyDown(event) {
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.type !== 'radio') {
        event.preventDefault()
        void advance()
      }
    },
    onSubmit(event) { event.preventDefault(); void advance() },
  }

  return {
    form,
    step,
    continueDisabled,
    back: () => setStep(step === 'review' ? 'amount' : 'recipient'),
    formEvents,
    payeesQuery: query,
    payees,
    remainingLimit,
  }
}
