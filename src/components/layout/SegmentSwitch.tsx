import type { Segment } from '../../api/types'

type SegmentSwitchProps = { segment: Segment; onChange: (segment: Segment) => void }

export function SegmentSwitch({ segment, onChange }: SegmentSwitchProps) {
  return (
    <div className="segment-switch" role="group" aria-label="Customer segment">
      <button type="button" aria-pressed={segment === 'retail'} onClick={() => onChange('retail')}>Retail</button>
      <button type="button" aria-pressed={segment === 'premium'} onClick={() => onChange('premium')}>Premium</button>
    </div>
  )
}
