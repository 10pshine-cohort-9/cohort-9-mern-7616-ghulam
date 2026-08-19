import { useNavigate, useSearchParams } from 'react-router-dom'
import type { NoteCardAction } from '../components/notes/NoteCard'
import { NoteGrid } from '../components/notes/NoteGrid'
import { NoteGridSkeleton } from '../components/notes/NoteGridSkeleton'
import { StatTiles } from '../components/notes/StatTiles'
import { Button, EmptyState, Icon } from '../components/ui'
import { useToast } from '../context/ToastContext'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useNotes } from '../hooks/useNotes'
import { formatRelativeTime } from '../lib/format'
import type { Note } from '../types'

const ACTIONS: readonly NoteCardAction[] = ['open', 'pin', 'favourite', 'archive', 'trash']
const SEARCH_DEBOUNCE_MS = 250

/** Timestamps are UTC ISO strings, so the newest is the largest as text. */
function newestEdit(notes: readonly Note[]): string | null {
  let newest: string | null = null
  for (const note of notes) {
    if (newest === null || note.updatedAt > newest) newest = note.updatedAt
  }
  return newest
}

export function Dashboard() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { notify } = useToast()

  // The top bar writes every keystroke to `?q=`. Without the delay each one is
  // its own query, and the list would be reloading while the word is half typed.
  const search = useDebouncedValue(params.get('q') ?? '', SEARCH_DEBOUNCE_MS)

  const listed = useNotes({ status: 'active', search })
  /*
   * The tiles describe the account, so they cannot read the searched list — the
   * totals would move as the user types. Archived notes are outside the active
   * query altogether, which is the second read.
   */
  const active = useNotes({ status: 'active' })
  const archived = useNotes({ status: 'archived' })

  const newest = newestEdit(active.notes)

  async function handleAction(action: NoteCardAction, note: Note) {
    try {
      switch (action) {
        case 'open':
          navigate(`/notes/${note.id}`)
          return
        case 'pin':
          await listed.setPinned(note.id, !note.isPinned)
          break
        case 'favourite':
          await listed.setFavourite(note.id, !note.isFavourite)
          break
        case 'archive':
          await listed.setStatus(note.id, 'archived')
          notify('success', 'Note archived')
          break
        case 'trash':
          await listed.setStatus(note.id, 'trashed')
          notify('success', 'Note moved to trash')
          break
        default:
          // restore and delete belong to the archived and trash views.
          return
      }

      // A mutation reloads its own hook and nothing else, so the two counting
      // queries would keep showing the totals from before the change.
      await Promise.all([active.refresh(), archived.refresh()])
    } catch (cause) {
      notify('error', 'That did not work', cause instanceof Error ? cause.message : undefined)
    }
  }

  function renderNotes() {
    // Every mutation puts the hook back into loading, so testing `isLoading`
    // alone would blink the whole grid away each time a note is pinned.
    if (listed.isLoading && listed.notes.length === 0) return <NoteGridSkeleton />

    if (listed.error) {
      return (
        <EmptyState
          action={
            <Button onClick={() => void listed.refresh()} variant="secondary">
              Try again
            </Button>
          }
          description={listed.error}
          icon="warning"
          title="Could not load your notes"
        />
      )
    }

    if (listed.notes.length === 0) {
      return search ? (
        <EmptyState
          description={`Nothing in your notes matches "${search}".`}
          icon="search"
          title="No matches"
        />
      ) : (
        <EmptyState
          action={<Button onClick={() => navigate('/notes/new')}>Create note</Button>}
          description="Your thoughts will live here. Create your first note to get started."
          icon="draw"
          title="No notes yet"
        />
      )
    }

    return (
      <NoteGrid
        actions={ACTIONS}
        notes={listed.notes}
        onAction={(action, note) => void handleAction(action, note)}
      />
    )
  }

  return (
    <div className="space-y-stack-md">
      <StatTiles
        archived={archived.notes.length}
        lastEdited={newest === null ? null : formatRelativeTime(newest)}
        pinned={active.notes.filter((note) => note.isPinned).length}
        total={active.notes.length}
      />

      <div>
        <h1 className="text-headline-xl text-primary">My notes</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Everything you have written, most recently edited first.
        </p>
      </div>

      {renderNotes()}

      {/* The top bar's create button covers the narrow layout, where a floating
          button would sit on top of the last card in the list. */}
      <button
        aria-label="Create note"
        className="group ambient-shadow fixed right-margin-page bottom-margin-page z-30 hidden h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform duration-200 ease-out hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95 md:flex"
        onClick={() => navigate('/notes/new')}
        type="button"
      >
        <Icon
          className="transition-transform duration-200 ease-out group-hover:rotate-90"
          name="add"
          size="lg"
        />
      </button>
    </div>
  )
}
