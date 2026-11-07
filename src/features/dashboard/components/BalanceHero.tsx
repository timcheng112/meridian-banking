import { NewTransferButton } from './NewTransferButton'
import { formatMoney } from '../../../lib/format'

type BalanceHeroProps = {
  total: number
  depositCount: number
}

export function BalanceHero({ total, depositCount }: BalanceHeroProps) {
  return (
    <section className="balance-hero" aria-labelledby="total-heading">
      <div className="balance-details">
        <h2 id="total-heading">Total available</h2>
        <p className="total-value amount">{formatMoney(total)}</p>
        <p>Across {depositCount} deposit {depositCount === 1 ? 'account' : 'accounts'}</p>
      </div>
      <div className="desktop-transfer"><NewTransferButton /></div>
    </section>
  )
}
