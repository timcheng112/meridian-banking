import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFormState, useWatch } from 'react-hook-form'
import { ApiError } from '../../api/client'
import { mapTransferField, transferRequest } from './transferSubmission'
import type { TransferSubmission } from './useTransferSubmission'
import type { Account, Customer } from '../../api/types'
import { payeesQuery } from './queries'
import { amountFields, createTransferSchema, recipientFields, type TransferStep, type TransferValues } from './transferSchema'

function serverErrorIdentity(name: keyof TransferValues, values: TransferValues) {
  if (name === 'amount') return JSON.stringify([values.amount, values.fromAccountId])
  if (name === 'bankName' || name === 'bankChoice') return JSON.stringify([values[name], values.bankChoice, values.recipientMode])
  if (recipientFields('new').includes(name) || name === 'payeeId') return JSON.stringify([values[name], values.recipientMode])
  return values[name]
}

export function useTransferForm({ customer, accounts, visible, submission, onInvalid }: {
  customer: Customer
  accounts: Account[]
  visible: boolean
  submission: TransferSubmission
  onInvalid: () => void
}) {
  const visibility = useRef(visible)
  visibility.current = visible
  const serverErrors = useRef<Partial<Record<keyof TransferValues, { value: string; message: string }>>>({})
  const busy = submission.phase === 'validating' || submission.phase === 'pending'
  const [step, setStep] = useState<TransferStep>('recipient')
  const query = useQuery(payeesQuery)
  const payees = query.data?.payees ?? []
  const remainingLimit = customer.dailyTransferLimit - customer.transferredToday
  const form = useForm<TransferValues>({
    resolver: async (values, context, options) => {
      const result = await zodResolver(createTransferSchema({ accounts, payees, remainingLimit }))(values, context, options)
      for (const [path, error] of Object.entries(serverErrors.current)) {
        const name = path as keyof TransferValues
        if (error.value !== serverErrorIdentity(name, values)) delete serverErrors.current[name]
        else result.errors[name] = { type: 'server', message: error.message }
      }
      return Object.keys(result.errors).length ? { values: {}, errors: result.errors } : result
    },
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
    if (submission.phase !== 'success' && !busy && getValues('amount').trim()) void trigger('amount')
  }, [accountId, availableBalance, remainingLimit, trigger, getValues, busy, submission.phase])

  const activeRecipientFields = recipientFields(mode).filter((path) => path !== 'bankName' || bankChoice === 'other')
  const activeFields = step === 'recipient' ? activeRecipientFields : amountFields
  const { errors } = useFormState({ control, name: activeFields })
  const continueDisabled = step !== 'review' && (
    activeFields.some((path) => Boolean(errors[path])) ||
    (step === 'amount' && !accounts.some((account) => account.type !== 'credit'))
  )

  async function advance() {
    if (step === 'review' || continueDisabled || submission.isLocked()) return
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
    if (!visibility.current) return
    const first = paths.find((path) => getFieldState(path).invalid)
    if (first === 'payeeId') {
      const target = document.querySelector<HTMLElement>('.transfer-dialog input[type="radio"]') ?? document.getElementById('new-recipient-toggle')
      target?.focus()
    } else if (first) setFocus(first)
  }

  function editErrors(target: 'recipient' | 'amount') {
    setStep(target)
    requestAnimationFrame(() => focusFirstInvalid(target === 'recipient' ? recipientFields(getValues('recipientMode')) : amountFields))
  }

  async function confirm() {
    if (step !== 'review' || !submission.begin()) return
    serverErrors.current = {}
    form.clearErrors()
    const paths = [...recipientFields(getValues('recipientMode')), ...amountFields]
    if (!await trigger(paths)) {
      submission.invalid()
      if (visibility.current) editErrors(paths.some((path) => recipientFields(getValues('recipientMode')).includes(path) && getFieldState(path).invalid) ? 'recipient' : 'amount')
      onInvalid()
      return
    }
    const values = getValues()
    try {
      await submission.submit(transferRequest(values))
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [path, message] of Object.entries(error.fields ?? {})) {
          const name = mapTransferField(path, values)
          if (name) {
            serverErrors.current[name] = { value: serverErrorIdentity(name, values), message }
            form.setError(name, { type: 'server', message })
          }
        }
      }
    }
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
    onSubmit(event) { event.preventDefault(); if (step === 'review') void confirm(); else void advance() },
  }

  return {
    form,
    busy,
    editErrors,
    step,
    continueDisabled,
    back: () => { if (!submission.isLocked()) setStep(step === 'review' ? 'amount' : 'recipient') },
    formEvents,
    payeesQuery: query,
    payees,
    remainingLimit,
  }
}
