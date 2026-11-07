import { formatMoney } from '../../../lib/format'

export function DailyLimitCard({ remaining }: { remaining: number }) {
  return (
    <section className="panel daily-limit" aria-labelledby="limit-heading">
      <h2 id="limit-heading">Daily transfer limit</h2>
      <p className="limit-value amount">{formatMoney(remaining)}</p>
      <p>remaining today</p>
      <p className="limit-note">Resets daily.<br />Applies to all transfers.</p>
    </section>
  )
}
