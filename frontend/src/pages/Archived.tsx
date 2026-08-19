import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { NoteFilters } from '../components/notes/NoteFilters'
import { NoteGrid } from '../components/notes/NoteGrid'
import { NoteGridSkeleton } from '../components/notes/NoteGridSkeleton'
import type { NoteCardAction } from '../components/notes/NoteCard'
import { EmptyState } from '../components/ui'
import { useNotes } from '../hooks/useNotes'
import { useToast } from '../context/ToastContext'
import type { Note, NoteSort } from '../types'

export function Archived() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  const [sort, setSort] = useState<NoteSort>('updated-desc')

  const { notes, isLoading, error, setStatus } = useNotes({
    status: 'archived',
    search,
    sort,
  })

  const handleAction = async (action: NoteCardAction, note: Note) => {
    try {
      if (action === 'open') {
        navigate(`/notes/${note.id}`)
      } else if (action === 'restore') {
        await setStatus(note.id, 'active')
        notify('success', 'Note restored to dashboard')
      } else if (action === 'trash') {
        await setStatus(note.id, 'trashed')
        notify('success', 'Note moved to trash')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed'
      notify('error', 'Error', message)
    }
  }

  if (isLoading && notes.length === 0) {
    return <NoteGridSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Archived Notes</h1>
          <p className="text-body-md text-on-surface-variant">Inactive and stored documents</p>
        </div>
        <NoteFilters value={sort} onChange={setSort} />
      </div>

      {error ? (
        <EmptyState icon="warning" title="Error Loading Archive" description={error} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon="archive"
          title={search ? `No archived notes matching "${search}"` : 'No archive found'}
          description={
            search
              ? 'Try adjusting your search query.'
              : 'Notes you archive are safely stored here out of your main workflow.'
          }
        />
      ) : (
        <NoteGrid
          notes={notes}
          actions={['open', 'restore', 'trash']}
          onAction={handleAction}
        />
      )}
    </div>
  )
}
