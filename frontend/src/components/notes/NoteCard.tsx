import { cn } from '../../lib/cn'
import { excerpt } from '../../lib/excerpt'
import { formatRelativeTime } from '../../lib/format'
import type { Note } from '../../types'
import { Icon } from '../ui'
import { NoteCardMenu } from './NoteCardMenu'

export type NoteCardAction =
  | 'open'
  | 'pin'
  | 'favourite'
  | 'archive'
  | 'trash'
  | 'restore'
  | 'delete'

interface NoteCardProps {
  note: Note
  /**
   * Which menu entries this view offers. The dashboard passes the first five;
   * archived passes open, restore and trash; trash passes restore and delete.
   * Naming the whole set here means those views reuse the card rather than
   * widening it later.
   */
  actions: readonly NoteCardAction[]
  onAction: (action: NoteCardAction, note: Note) => void
}

export function NoteCard({ note, actions, onAction }: NoteCardProps) {
  const preview = excerpt(note.content)

  return (
    <article className="glass-panel flex flex-col rounded-xxl p-8">
      <div className="mb-4 flex items-start justify-between gap-3">
        {/* The title opens the note rather than the whole card doing it: a
            card-wide target would put the star and the menu inside another
            control. */}
        <button
          className="min-w-0 flex-1 text-left text-headline-md text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => onAction('open', note)}
          type="button"
        >
          {note.title || 'Untitled note'}
        </button>

        {note.isPinned && <Icon className="mt-1 text-accent-gold" name="pin_filled" size="sm" />}
      </div>

      <p className="mb-6 line-clamp-3 text-body-md text-on-surface-variant">
        {preview || 'This note is empty.'}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-glass-stroke pt-4">
        <span className="font-mono text-label-caps text-on-surface-variant uppercase">
          Edited {formatRelativeTime(note.updatedAt)}
        </span>

        <div className="flex items-center gap-1">
          {/* `aria-pressed` with a fixed label, not a label that flips: the
              state belongs in the state attribute, and a screen reader reads
              both. */}
          <button
            aria-label="Favourite"
            aria-pressed={note.isFavourite}
            className={cn(
              'rounded-full p-2 transition-colors duration-200 ease-out hover:bg-secondary/10',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              note.isFavourite ? 'text-accent-gold' : 'text-on-surface-variant',
            )}
            onClick={() => onAction('favourite', note)}
            type="button"
          >
            <Icon name={note.isFavourite ? 'star_filled' : 'star'} size="sm" />
          </button>

          <NoteCardMenu actions={actions} note={note} onAction={onAction} />
        </div>
      </div>
    </article>
  )
}
