import type { Segment } from '../../api/types'
import { Icon } from '../ui/Icon'
import { SegmentSwitch } from './SegmentSwitch'
import { ThemeToggle } from './ThemeToggle'
import './layout.css'

type HeaderProps = {
  theme: 'light' | 'dark'
  segment: Segment
  onThemeToggle: () => void
  onSegmentChange: (segment: Segment) => void
}

export function Header({ theme, segment, onThemeToggle, onSegmentChange }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <strong className="brand-logo">M <span>Meridian</span></strong>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#main-content" aria-current="page"><Icon name="grid" />Overview</a>
          {['Cards', 'Payments', 'Insights'].map((label) => <button type="button" disabled key={label}>{label}</button>)}
        </nav>
        <div className="header-controls">
          <div className="desktop-segment"><SegmentSwitch segment={segment} onChange={onSegmentChange} /></div>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          <span className="customer-avatar" aria-label="Ava Chen">AC</span>
        </div>
      </div>
    </header>
  )
}
