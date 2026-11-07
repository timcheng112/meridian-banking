import type { TransferStep } from '../transferSchema'
export function Stepper({ step }: { step: TransferStep }) {
  const steps = ['recipient', 'amount', 'review'] as const
  const current = steps.indexOf(step)
  return <ol className="transfer-stepper" aria-label="Transfer progress">
    {steps.map((item, index) => <li
      key={item}
      aria-current={item === step ? 'step' : undefined}
      data-complete={index < current}
    >
      <span className="step-circle" aria-hidden="true">
        {index < current ? <svg viewBox="0 0 16 16">
          <path d="m3 8 3 3 7-7" />
        </svg> : index + 1}
      </span>
      <span>
        {item[0].toUpperCase() + item.slice(1)}
      </span>
    </li>)}
  </ol>
}
