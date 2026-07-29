import { useState, type ReactNode } from 'react'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Icon,
  IconButton,
  Skeleton,
  TextField,
  Toast,
  type ToastTone,
} from './components/ui'

/**
 * Temporary primitive gallery, replaced by the router in the app-shell task. It
 * exists so every variant of every primitive can be checked against the
 * component-library mockup in both palettes before a real screen depends on it.
 */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-stack-lg">
      <h2 className="mb-stack-sm text-headline-md text-primary">{title}</h2>
      <div className="glass-panel rounded-xxl p-stack-md">{children}</div>
    </section>
  )
}

export default function App() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [email, setEmail] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastTone[]>(['success', 'error'])

  function toggleTheme() {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    setIsDark(next)
  }

  return (
    <main className="mx-auto max-w-[var(--container-max)] px-margin-page py-stack-lg">
      <header className="mb-stack-lg flex items-start justify-between gap-stack-md border-b border-glass-stroke pb-stack-md">
        <div>
          <p className="mb-2 font-mono text-label-caps text-muted-green">SYSTEM v1.0</p>
          <h1 className="mb-4 text-headline-xl text-primary">Core Components</h1>
          <p className="max-w-[65ch] text-body-lg text-on-surface-variant">
            The primitives every Aether Notes screen is assembled from. Switch the theme to
            check each one against both palettes.
          </p>
        </div>
        <IconButton
          label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          name={isDark ? 'light_mode' : 'dark_mode'}
          onClick={toggleTheme}
        />
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-6">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">
            Ghost <Icon name="link" size="sm" />
          </Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Delete forever</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-glass-stroke pt-6">
          <Button size="sm">Small</Button>
          <Button isLoading>Saving</Button>
          <Button disabled>Disabled</Button>
          <IconButton label="Create note" name="add" />
          <IconButton label="Search notes" name="search" />
          <IconButton label="Pin note" name="pin" />
        </div>
      </Section>

      <Section title="Form elements">
        <div className="grid max-w-[420px] gap-stack-sm">
          <TextField
            autoComplete="email"
            label="Email address"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            type="email"
            value={email}
          />
          <TextField
            error="Enter a password of at least 8 characters."
            label="Password"
            placeholder="••••••••"
            type="password"
          />
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">New draft</Badge>
          <Badge tone="neutral">Archived</Badge>
          <Badge tone="muted">Synced</Badge>
        </div>
      </Section>

      <Section title="Loading">
        <div aria-busy="true" className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-40 w-full rounded-xxl" />
        </div>
      </Section>

      <Section title="Notifications">
        <div className="flex max-w-[420px] flex-col gap-4">
          {toasts.map((tone) => (
            <Toast
              description={
                tone === 'success'
                  ? 'All your notes are now up to date.'
                  : 'Retrying in 5 seconds.'
              }
              key={tone}
              onDismiss={() => setToasts((current) => current.filter((t) => t !== tone))}
              title={tone === 'success' ? 'Sync complete' : 'Connection lost'}
              tone={tone}
            />
          ))}
          {toasts.length < 2 && (
            <Button onClick={() => setToasts(['success', 'error'])} size="sm" variant="ghost">
              Restore both
            </Button>
          )}
        </div>
      </Section>

      <Section title="Confirmation">
        <Button onClick={() => setConfirmOpen(true)} variant="danger">
          Delete note
        </Button>
        <ConfirmDialog
          confirmLabel="Delete forever"
          description="This note will be permanently deleted. This cannot be undone."
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => setConfirmOpen(false)}
          open={confirmOpen}
          title="Delete this note?"
        />
      </Section>

      <h2 className="mb-stack-sm text-headline-md text-primary">Empty views</h2>
      <EmptyState
        action={<Button variant="outline">Create note</Button>}
        description="Your thoughts will live here. Create your first note to get started."
        icon="draw"
        title="No notes yet"
      />
    </main>
  )
}
