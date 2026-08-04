import { useTheme } from '../../context/ThemeContext'
import { IconButton } from '../ui'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  // The label names the destination rather than the current state, so a screen
  // reader announces what the press will do instead of what it undoes.
  return (
    <IconButton
      className={className}
      label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      name={isDark ? 'light_mode' : 'dark_mode'}
      onClick={toggle}
    />
  )
}
