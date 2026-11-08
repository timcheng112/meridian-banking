import { Button } from '../../../components/ui/Button'
import type { TransferStep } from '../transferSchema'

type Props = {
  step: TransferStep
  continueDisabled: boolean
  busy: boolean
  onBack: () => void
  onClose: () => void
}
export function TransferFooter({ step, continueDisabled, busy, onBack, onClose }: Props) {
  return <>
    <div className="transfer-actions">
      <Button
        disabled={busy}
        type="button"
        variant="secondary"
        onClick={step === 'recipient' ? onClose : onBack}
      >
        {step === 'recipient' ? 'Cancel' : 'Back'}
      </Button>
      {step === 'review' ? <Button type="submit" form="transfer-form" disabled={busy}>{busy ? <><span className="transfer-spinner" aria-hidden="true" />Sending…</> : 'Confirm transfer'}</Button> : <Button
        type="submit"
        form="transfer-form"
        disabled={continueDisabled || busy}
      >Continue</Button>}
    </div>
  </>
}
