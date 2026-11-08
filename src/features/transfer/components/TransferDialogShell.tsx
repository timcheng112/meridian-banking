import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Stepper } from './Stepper'
import type { TransferStep } from '../transferSchema'

type Props = {
  step: TransferStep
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}
export function TransferDialogShell({ step, onClose, children, footer }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const dialog = dialogRef.current!
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      document.body.style.overflow = overflow
    }
  }, [])
  useLayoutEffect(() => {
    bodyRef.current?.scrollTo?.(0, 0)
    bodyRef.current?.querySelector<HTMLElement>('h3')?.focus()
  }, [step])
  return <dialog
    ref={dialogRef}
    className="transfer-dialog"
    aria-labelledby="transfer-title"
    onCancel={(event) => { event.preventDefault(); onClose() }}
  >
    <header className="transfer-header">
      <div className="transfer-title-row">
        <h2 id="transfer-title">New transfer</h2>
        <button
          type="button"
          className="transfer-close"
          aria-label="Close transfer"
          onClick={onClose}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      </div>
      <Stepper step={step} />
    </header>
    <div className="transfer-body" ref={bodyRef}>
      {children}
    </div>
    <footer className="transfer-footer">
      {footer}
    </footer>
  </dialog>
}
