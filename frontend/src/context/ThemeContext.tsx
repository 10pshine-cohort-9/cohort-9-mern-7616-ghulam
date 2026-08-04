import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark'

/*
 * The one localStorage key outside services/local/storage.ts. That module owns
 * the data the backend takes over in week 2 and is deleted with the adapter;
 * a theme choice is client-only and has to outlive it.
 */
const STORAGE_KEY = 'aether.theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/*
 * Read back the class the inline script in index.html already applied instead
 * of re-deriving it from storage. That script exists to beat the first paint,
 * and a second copy of the same rule here is how the two get to disagree.
 */
function appliedTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(appliedTheme)
  const [followsSystem, setFollowsSystem] = useState(
    () => localStorage.getItem(STORAGE_KEY) === null,
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (!followsSystem) return

    const media = window.matchMedia(DARK_QUERY)
    const follow = (event: MediaQueryListEvent) => setTheme(event.matches ? 'dark' : 'light')
    media.addEventListener('change', follow)
    return () => media.removeEventListener('change', follow)
  }, [followsSystem])

  /*
   * Nothing is written until the user picks one. Persisting the resolved value
   * on load would pin the app to whatever the OS happened to be at first visit
   * and silently stop it following the system afterwards.
   */
  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
    setFollowsSystem(false)
  }, [])

  const value = useMemo<ThemeContextValue>(() => ({ theme, toggle }), [theme, toggle])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// Colocated with its provider for the same reason as useAuth — see AuthContext.
// eslint-disable-next-line react/only-export-components
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme must be used inside a ThemeProvider.')
  }
  return context
}
