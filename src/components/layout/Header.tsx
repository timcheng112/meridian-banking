import type { ReactNode } from 'react'
import { Icon } from '../ui/Icon'
import './layout.css'

type HeaderProps = {
  brand: { mark: string; name: string }
  navigation: ReadonlyArray<{ label: string; href?: string; current?: boolean }>
  customer: { name: string; initials: string }
  controls: ReactNode
}

export function Header({
  brand,
  navigation,
  customer,
  controls,
}: HeaderProps) {
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
          {controls}
          <span className="customer-avatar" aria-label={customer.name}>{customer.initials}</span>
        </div>
      </div>
    </header>
  )
}
