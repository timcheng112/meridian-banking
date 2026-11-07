import type { Segment } from '../../api/types'
import { SegmentSwitch } from './SegmentSwitch'
import { ThemeToggle } from './ThemeToggle'

type HeaderControlsProps = {
  segmentOptions: ReadonlyArray<{ value: Segment; label: string }>
  segment: Segment
  theme: 'light' | 'dark'
  onSegmentChange: (segment: Segment) => void
  onThemeToggle: () => void
}

export function HeaderControls({
  segmentOptions,
  segment,
  theme,
  onSegmentChange,
  onThemeToggle,
}: HeaderControlsProps) {
  return (
    <>
      <div className="desktop-segment">
        <SegmentSwitch options={segmentOptions} segment={segment} onChange={onSegmentChange} />
      </div>
      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
    </>
  )
}
