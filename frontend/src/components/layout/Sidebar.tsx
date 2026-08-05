import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from '../ui'
import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/favourites', label: 'Favourites', icon: 'star' },
  { to: '/archived', label: 'Archived', icon: 'archive' },
  { to: '/trash', label: 'Trash', icon: 'delete' },
] as const satisfies readonly { to: string; label: string; icon: IconName }[]

const ROW =
  'flex items-center gap-3 rounded-lg px-4 py-3 text-body-md ' +
  // Named properties rather than `transition-all`, which would fade the focus
  // ring in over 200ms. See Button.
  'transition-[background-color,color] duration-200 ease-out ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const QUIET_ROW = 'text-on-surface-variant hover:bg-secondary/10 hover:text-primary'

/** Two letters at most: "Ghulam Mujtaba" reads GM, "Ada" reads A. */
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

interface SidebarProps {
  className?: string
  /** Lets the mobile drawer close itself once a destination is chosen. */
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth()
  const { notify } = useToast()

  // Unreachable in practice — the shell only mounts inside ProtectedRoute — but
  // it narrows the type without a non-null assertion on every field below.
  if (user === null) return null

  async function handleLogout() {
    try {
      await logout()
    } catch {
      notify('error', 'Could not sign out', 'Check your connection and try again.')
    }
  }

  return (
    <aside
      className={cn(
        'flex w-64 shrink-0 flex-col border-r border-glass-stroke bg-surface/80 px-stack-sm py-stack-md backdrop-blur-xl',
        className,
      )}
    >
      {/* Not an <h1>: this repeats on every screen, and the heading a page
          announces should be that page's own. */}
      <div className="mb-stack-md px-4">
        <p className="text-headline-md text-primary">Aether Notes</p>
        <p className="font-mono text-label-caps text-muted-green">Minimal Luxury</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                ROW,
                isActive
                  ? 'bg-secondary-container font-semibold text-on-secondary-container'
                  : QUIET_ROW,
              )
            }
            // Without `end` the index route matches every path below it and
            // Dashboard would stay highlighted on Favourites, Archived and Trash.
            end={item.to === '/'}
            key={item.to}
            onClick={onNavigate}
            to={item.to}
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-1 border-t border-glass-stroke pt-stack-sm">
        {/* The identity row gets the full width: sharing it with the theme
            toggle left roughly 88px for a name, which truncated most of them. */}
        <NavLink
          className={({ isActive }) =>
            cn(ROW, 'min-w-0', isActive ? 'bg-secondary-container' : QUIET_ROW)
          }
          onClick={onNavigate}
          to="/profile"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container font-mono text-label-caps text-primary"
          >
            {initials(user.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-label-sm text-on-surface">{user.name}</span>
            <span className="block truncate text-[12px] text-on-surface-variant">
              {user.email}
            </span>
          </span>
        </NavLink>

        <div className="flex items-center gap-2">
          <button
            className={cn(ROW, QUIET_ROW, 'min-w-0 flex-1')}
            onClick={handleLogout}
            type="button"
          >
            <Icon name="logout" />
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
