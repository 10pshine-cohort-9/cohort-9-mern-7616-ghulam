import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AuthBrandPanel } from './AuthBrandPanel'

interface AuthLayoutProps {
  title: string
  subtitle: string
  /** Whatever the service rejected the submission with, shown above the form. */
  error?: string | null
  children: ReactNode
}

/**
 * The frame both public pages share: brand panel on the left from `lg` up, form
 * card on the right. Sign-up has no mockup of its own and is this layout with a
 * different heading and two more fields.
 */
export function AuthLayout({ title, subtitle, error, children }: AuthLayoutProps) {
  const { user, isLoading } = useAuth()

  // ProtectedRoute's guard in reverse, and the reason neither form calls
  // `navigate`: signing in sets the user, and this sends them on. Rendering
  // nothing mid-restore keeps the form from appearing only to be replaced.
  if (isLoading) return null
  if (user !== null) return <Navigate replace to="/" />

  return (
    <main className="flex min-h-screen">
      <AuthBrandPanel />

      <section className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-margin-page">
        <div className="glass-panel ambient-shadow w-full max-w-[440px] rounded-xxl p-8 md:p-10">
          <p className="mb-8 text-headline-md text-primary lg:hidden">Aether Notes</p>

          <h1 className="text-headline-lg text-primary">{title}</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">{subtitle}</p>

          {error && (
            <p
              className="mt-6 rounded-xl bg-error-container px-4 py-3 text-label-sm text-on-error-container"
              role="alert"
            >
              {error}
            </p>
          )}

          {children}
        </div>
      </section>
    </main>
  )
}
