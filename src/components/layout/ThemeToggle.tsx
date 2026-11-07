import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

type ThemeToggleProps = { theme: 'light' | 'dark'; onToggle: () => void }

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return <Button type="button" variant="secondary" className="theme-toggle" aria-label="Dark mode" aria-pressed={theme === 'dark'} onClick={onToggle}><Icon name="theme" /></Button>
}
