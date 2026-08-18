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

export function Favourites() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  const [sort, setSort] = useState<NoteSort>('updated-desc')

  const { notes, isLoading, error, setPinned, setFavourite, setStatus } = useNotes({
    status: 'active',
    favouritesOnly: true,
    search,
    sort,
  })

  const handleAction = async (action: NoteCardAction, note: Note) => {
    try {
      if (action === 'open') {
        navigate(`/notes/${note.id}`)
      } else if (action === 'pin') {
        await setPinned(note.id, !note.isPinned)
      } else if (action === 'favourite') {
        await setFavourite(note.id, !note.isFavourite)
      } else if (action === 'archive') {
        await setStatus(note.id, 'archived')
        notify('success', 'Note moved to archive')
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
          <h1 className="text-headline-lg font-bold text-on-surface">Favourites</h1>
          <p className="text-body-md text-on-surface-variant">Starred and pinned key notes</p>
        </div>
        <NoteFilters value={sort} onChange={setSort} />
      </div>

      {error ? (
        <EmptyState icon="warning" title="Error Loading Favourites" description={error} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon="star"
          title={search ? `No favourite notes matching "${search}"` : 'No favourited notes'}
          description={
            search
              ? 'Try adjusting your search criteria.'
              : 'Star your important notes to keep them easily accessible here.'
          }
        />
      ) : (
        <NoteGrid
          notes={notes}
          actions={['open', 'pin', 'favourite', 'archive', 'trash']}
          onAction={handleAction}
        />
      )}
    </div>
  )
}
