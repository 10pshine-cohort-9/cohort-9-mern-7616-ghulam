import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Toast, type ToastTone } from '../components/ui'
import { createId } from '../lib/id'

/**
 * Mounts the Toast primitive and gives every screen one way to surface the
 * result of a mutation. Without it the rejection paths in useNotes have nowhere
 * to go and a failed save looks identical to a successful one.
 */

const DISMISS_AFTER_MS = 5000

interface ToastRecord {
  id: string
  tone: ToastTone
  title: string
  description?: string
}

interface ToastContextValue {
  notify: (tone: ToastTone, title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const timers = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      // Without this a manual dismiss leaves the timeout to fire into an empty
      // list, and a later toast reusing the slot would vanish early.
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = createId()
      setToasts((current) => [...current, { id, tone, title, description }])
      timers.current.set(id, window.setTimeout(() => dismiss(id), DISMISS_AFTER_MS))
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/*
        The stack itself is click-through: it spans a corner of the viewport at
        all times, and without this it would swallow clicks on whatever sits
        underneath even with no toast showing. Each toast opts back in.

        The entrance needs no reduced-motion branch — `toast-in` is finite, so
        the global rule in index.css collapsing it to 0.01ms is the correct
        outcome rather than the flicker an infinite animation would give.
      */}
      <div className="pointer-events-none fixed right-6 bottom-6 z-50 flex w-[min(24rem,calc(100vw-3rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div className="pointer-events-auto" key={toast.id}>
            <Toast
              description={toast.description}
              onDismiss={() => dismiss(toast.id)}
              title={toast.title}
              tone={toast.tone}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Colocated with its provider for the same reason as useAuth — see AuthContext.
// eslint-disable-next-line react/only-export-components
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (context === null) {
    throw new Error('useToast must be used inside a ToastProvider.')
  }
  return context
}
