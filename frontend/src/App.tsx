import DrawIcon from '@material-symbols/svg-400/outlined/draw.svg?react'
import KeepIcon from '@material-symbols/svg-400/outlined/keep.svg?react'
import { useState } from 'react'

/**
 * Temporary token check. The router replaces this in the app-shell task; it
 * exists so the design tokens, icon pipeline and dark-mode wiring can be
 * verified before any real screen depends on them.
 */
export default function App() {
  const [isDark, setIsDark] = useState(false)

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <main className="min-h-screen px-margin-page py-stack-lg">
      <p className="font-mono text-label-caps text-muted-green mb-2">SYSTEM v1.0</p>
      <h1 className="text-headline-xl text-primary mb-4">Aether Notes</h1>

      <div className="glass-panel ambient-shadow rounded-xxl p-stack-md max-w-[720px]">
        <p className="text-body-lg text-on-surface-variant mb-stack-sm">
          Every colour here comes from a design token. Switching themes repaints all of
          them without a reload, and the icons follow the text colour.
        </p>

        <div className="mb-stack-md flex flex-wrap gap-2">
          <span className="bg-primary-container text-on-primary-container rounded-full px-4 py-2 text-label-sm">
            primary-container
          </span>
          <span className="bg-secondary-container text-on-secondary-container rounded-full px-4 py-2 text-label-sm">
            secondary-container
          </span>
          <span className="bg-surface-variant text-on-surface-variant rounded-full px-4 py-2 text-label-sm">
            surface-variant
          </span>
          <span className="border-glass-stroke text-muted-green rounded-full border px-4 py-2 text-label-sm">
            glass-stroke
          </span>
        </div>

        <div className="mb-stack-md text-primary flex items-center gap-4">
          <DrawIcon className="text-[32px]" />
          <KeepIcon className="text-[32px]" />
          <span className="text-on-surface-variant text-label-sm">
            icons inherit colour and scale with font-size
          </span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="bg-primary-container text-on-primary-container ambient-shadow focus-visible:outline-primary rounded-full px-6 py-3 text-label-sm transition-transform duration-200 ease-out hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Switch to {isDark ? 'light' : 'dark'}
        </button>
      </div>
    </main>
  )
}
