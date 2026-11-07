import type { Segment } from '../../api/types'

type SegmentSwitchProps = {
  options: ReadonlyArray<{ value: Segment; label: string }>
  segment: Segment
  onChange: (segment: Segment) => void
}

export function SegmentSwitch({ options, segment, onChange }: SegmentSwitchProps) {
  return (
    <div className="segment-switch" role="group" aria-label="Customer segment">
      {options.map(({ value, label }) => (
        <button key={value} type="button" aria-pressed={segment === value} onClick={() => onChange(value)}>{label}</button>
      ))}
    </div>
  )
}
