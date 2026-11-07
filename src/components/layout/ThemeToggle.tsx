import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

type ThemeToggleProps = { theme: 'light' | 'dark'; onToggle: () => void }

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'

  return (
    <Button type="button" variant="secondary" className="theme-toggle" aria-label={label} title={label} onClick={onToggle}>
      <Icon name={theme === 'light' ? 'theme' : 'sun'} />
    </Button>
  )
}
