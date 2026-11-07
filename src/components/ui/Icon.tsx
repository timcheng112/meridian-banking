import type { CSSProperties } from 'react'
import grid from '../../assets/icons/grid.svg'
import theme from '../../assets/icons/theme.svg'
import plus from '../../assets/icons/plus.svg'

const icons = { grid, theme, plus }

export function Icon({ name }: { name: keyof typeof icons }) {
  return <span aria-hidden="true" className={`ui-icon ui-icon-${name}`} style={{ '--icon-url': `url("${icons[name]}")` } as CSSProperties} />
}
