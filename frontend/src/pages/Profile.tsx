import type { ReactElement } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotes } from '../hooks/useNotes'
import { Button, Icon, Skeleton } from '../components/ui'

export function Profile(): ReactElement | null {
  const { user, logout } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()

  const { notes: activeNotes, isLoading: loadingActive, error: errorActive } = useNotes({ status: 'active' })
  const { notes: archivedNotes, isLoading: loadingArchived, error: errorArchived } = useNotes({ status: 'archived' })
  const { notes: trashedNotes, isLoading: loadingTrashed, error: errorTrashed } = useNotes({ status: 'trashed' })

  if (!user) return null

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const isLoadingStats = loadingActive || loadingArchived || loadingTrashed
  const statsError = errorActive || errorArchived || errorTrashed
  const totalNotesCount = activeNotes.length + archivedNotes.length + trashedNotes.length

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">Account Profile</h1>
        <p className="text-body-md text-on-surface-variant">Manage your account preferences and view statistics</p>
      </div>

      <div className="glass-panel ambient-shadow rounded-xxl p-stack-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-2xl shadow-md">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="text-headline-md font-semibold text-on-surface">{user.name}</h2>
            <p className="text-body-md text-on-surface-variant">{user.email}</p>
            <p className="text-label-caps text-muted-green font-mono uppercase mt-1">
              Member since {memberSince}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={logout} className="shrink-0">
          <Icon name="logout" size="sm" className="mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-headline-md font-semibold text-on-surface">Workspace Statistics</h3>
        {isLoadingStats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : statsError ? (
          <div className="glass-panel rounded-xl p-4 text-center text-error">
            Failed to load statistics.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel rounded-xl p-4 text-center">
              <span className="block text-label-caps text-muted-green font-mono uppercase">Total</span>
              <span className="text-headline-lg font-bold text-primary">{totalNotesCount}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center">
              <span className="block text-label-caps text-muted-green font-mono uppercase">Active</span>
              <span className="text-headline-lg font-bold text-on-surface">{activeNotes.length}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center">
              <span className="block text-label-caps text-muted-green font-mono uppercase">Archived</span>
              <span className="text-headline-lg font-bold text-on-surface-variant">{archivedNotes.length}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center">
              <span className="block text-label-caps text-muted-green font-mono uppercase">Trashed</span>
              <span className="text-headline-lg font-bold text-error">{trashedNotes.length}</span>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-stack-md space-y-4">
        <h3 className="text-headline-md font-semibold text-on-surface">Appearance Settings</h3>
        <div className="flex items-center justify-between py-2 border-t border-glass-stroke">
          <div>
            <p className="font-semibold text-on-surface">Interface Theme</p>
            <p className="text-body-md text-on-surface-variant">
              Currently active: <span className="capitalize font-mono font-bold text-primary">{theme} mode</span>
            </p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size="sm" className="mr-2" />
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
      </div>
    </div>
  )
}
