import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'

export function NewTransferButton() {
  return <Button type="button" className="transfer-button" disabled><Icon name="plus" />New transfer</Button>
}
