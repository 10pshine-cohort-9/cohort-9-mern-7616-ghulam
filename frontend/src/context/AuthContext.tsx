import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  /** True while the session is being restored. Distinct from "signed out". */
  isLoading: boolean
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    authService
      .getCurrentUser()
      .then((restored) => {
        if (!cancelled) setUser(restored)
      })
      .catch(() => {
        // A session that cannot be read is a signed-out session. There is no
        // screen to show an error on yet — the router is still deciding where
        // to send us.
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Errors propagate: the auth forms render them inline, which they cannot do if
  // this layer swallows them.
  const register = useCallback(async (name: string, email: string, password: string) => {
    setUser(await authService.register(name, email, password))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setUser(await authService.login(email, password))
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, register, login, logout }),
    [user, isLoading, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/*
 * Colocated with the provider on purpose. Splitting it out would satisfy the
 * fast-refresh rule but buys nothing here: this provider wraps the whole app, so
 * editing it remounts everything either way.
 */
// eslint-disable-next-line react/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used inside an AuthProvider.')
  }
  return context
}
