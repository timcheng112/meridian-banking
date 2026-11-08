import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Stepper } from './Stepper'
import type { TransferStep } from '../transferSchema'

type Props = {
  visible: boolean
  view: TransferStep | 'success'
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}
export function TransferDialogShell({ visible, view, onClose, children, footer }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!visible) return
    const dialog = dialogRef.current!
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      document.body.style.overflow = overflow
    }
  }, [visible])
  useLayoutEffect(() => {
    if (!visible) return
    bodyRef.current?.scrollTo?.(0, 0)
    bodyRef.current?.querySelector<HTMLElement>('.transfer-send-error, h3')?.focus()
  }, [view, visible])
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
      {view !== 'success' ? <Stepper step={view} /> : null}
    </header>
    <div className="transfer-body" ref={bodyRef}>
      {children}
    </div>
    <footer className="transfer-footer">
      {footer}
    </footer>
  </dialog>
}
