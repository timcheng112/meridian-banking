import type { MouseEventHandler } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'

export function NewTransferButton({ onClick, disabled = false }: { onClick?: MouseEventHandler<HTMLButtonElement>; disabled?: boolean }) {
  return <Button type="button" className="transfer-button" disabled={disabled} onClick={onClick}><Icon name="plus" />New transfer</Button>
}
