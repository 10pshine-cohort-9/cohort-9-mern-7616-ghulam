import { useEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

/**
 * The frame every authenticated screen renders inside: a permanent rail from
 * `lg` up, the same sidebar as an off-canvas drawer below it, and a top bar
 * that owns the search term.
 */
export function AppShell() {
  const [isNavOpen, setNavOpen] = useState(false)
  const drawerRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = drawerRef.current
    if (!el) return
    if (isNavOpen && !el.open) el.showModal()
    if (!isNavOpen && el.open) el.close()
  }, [isNavOpen])

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault()
    setNavOpen(false)
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === drawerRef.current) setNavOpen(false)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden lg:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenNav={() => setNavOpen(true)} />
        <main className="mx-auto w-full max-w-[var(--container-max)] flex-1 px-5 py-stack-md lg:px-margin-page">
          <Outlet />
        </main>
      </div>

      {/*
        The drawer is a modal <dialog> for the same reason ConfirmDialog is:
        `showModal()` gives the focus trap, the inert background and
        Escape-to-close outright. A hand-rolled panel has to reimplement all
        three, and the keyboard half is where those go wrong.
      */}
      <dialog
        aria-label="Navigation"
        className="m-0 h-full max-h-none p-0 backdrop:bg-primary/20 backdrop:backdrop-blur-[20px] open:drawer-in lg:hidden"
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        ref={drawerRef}
      >
        <Sidebar className="h-full" onNavigate={() => setNavOpen(false)} />
      </dialog>
    </div>
  )
}
