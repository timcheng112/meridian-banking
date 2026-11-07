import type { Segment } from '../../api/types'
import { Icon } from '../ui/Icon'
import { SegmentSwitch } from './SegmentSwitch'
import { ThemeToggle } from './ThemeToggle'
import './layout.css'

type HeaderProps = {
  brand: { mark: string; name: string }
  navigation: ReadonlyArray<{ label: string; href?: string; current?: boolean }>
  customerName: string
  customerInitials: string
  segmentOptions: ReadonlyArray<{ value: Segment; label: string }>
  theme: 'light' | 'dark'
  segment: Segment
  onThemeToggle: () => void
  onSegmentChange: (segment: Segment) => void
}

export function Header({ brand, navigation, customerName, customerInitials, segmentOptions, theme, segment, onThemeToggle, onSegmentChange }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <strong className="brand-logo">{brand.mark} <span>{brand.name}</span></strong>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(({ label, href, current }) => href ? (
            <a key={label} href={href} aria-current={current ? 'page' : undefined}>{current ? <Icon name="grid" /> : null}{label}</a>
          ) : <button type="button" disabled key={label}>{label}</button>)}
        </nav>
        <div className="header-controls">
          <div className="desktop-segment"><SegmentSwitch options={segmentOptions} segment={segment} onChange={onSegmentChange} /></div>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          <span className="customer-avatar" aria-label={customerName}>{customerInitials}</span>
        </div>
      </div>
    </header>
  )
}
