import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import type { Note } from '../../types'
import { Icon, type IconName } from '../ui'
import type { NoteCardAction } from './NoteCard'

const ENTRIES = {
  open: { label: 'Edit note', icon: 'edit' },
  pin: { label: 'Pin', icon: 'pin' },
  favourite: { label: 'Add to favourites', icon: 'star' },
  archive: { label: 'Archive', icon: 'archive' },
  trash: { label: 'Move to trash', icon: 'delete' },
  restore: { label: 'Restore', icon: 'restore' },
  delete: { label: 'Delete forever', icon: 'delete_forever' },
} as const satisfies Record<NoteCardAction, { label: string; icon: IconName }>

/** The two toggles read differently depending on where the note already is. */
function entryFor(action: NoteCardAction, note: Note): { label: string; icon: IconName } {
  if (action === 'pin' && note.isPinned) return { label: 'Unpin', icon: 'unpin' }
  if (action === 'favourite' && note.isFavourite) {
    return { label: 'Remove from favourites', icon: 'star_filled' }
  }
  return ENTRIES[action]
}

interface NoteCardMenuProps {
  note: Note
  actions: readonly NoteCardAction[]
  onAction: (action: NoteCardAction, note: Note) => void
}

/**
 * The card's overflow menu, built as a disclosure rather than an ARIA menu.
 * `role="menu"` promises arrow-key navigation and a roving tabindex; a handful
 * of buttons in a popup gets tab order and Enter for free, and claiming the
 * pattern without implementing it is worse than not claiming it.
 */
export function NoteCardMenu({ note, actions, onAction }: NoteCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!isOpen) return

    // `pointerdown` rather than `click`: it fires before focus moves, so the
    // menu is gone by the time whatever was pressed underneath reacts.
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      // Escape from inside the panel would otherwise drop focus to the body and
      // leave a keyboard user at the top of the page.
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function choose(action: NoteCardAction) {
    setIsOpen(false)
    onAction(action, note)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label="Note actions"
        className="rounded-full p-2 text-on-surface-variant transition-colors duration-200 ease-out hover:bg-secondary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => setIsOpen((open) => !open)}
        ref={triggerRef}
        type="button"
      >
        <Icon name="more_horiz" size="sm" />
      </button>

      {isOpen && (
        // Opens upward: the trigger sits in the card footer, and a panel hanging
        // below it would fall outside the card on every row of the grid.
        <div
          className="glass-panel ambient-shadow absolute right-0 bottom-full z-20 mb-2 w-56 space-y-1 rounded-xxl p-2"
          id={panelId}
        >
          {actions.map((action) => {
            const entry = entryFor(action, note)
            const isDestructive = action === 'delete'

            return (
              <button
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left',
                  'transition-colors duration-200 ease-out',
                  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                  isDestructive
                    ? 'text-error hover:bg-error/10'
                    : 'text-on-surface hover:bg-secondary-container',
                )}
                key={action}
                onClick={() => choose(action)}
                type="button"
              >
                <Icon
                  className={isDestructive ? undefined : 'text-primary'}
                  name={entry.icon}
                  size="sm"
                />
                <span className="text-body-md">{entry.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
