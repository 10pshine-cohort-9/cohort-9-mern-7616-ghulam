import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { NoteFilters } from '../components/notes/NoteFilters'
import { NoteGrid } from '../components/notes/NoteGrid'
import { NoteGridSkeleton } from '../components/notes/NoteGridSkeleton'
import type { NoteCardAction } from '../components/notes/NoteCard'
import { Button, ConfirmDialog, EmptyState } from '../components/ui'
import { useNotes } from '../hooks/useNotes'
import { useToast } from '../context/ToastContext'
import { notesService } from '../services'
import type { Note, NoteSort } from '../types'

export function Trash() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  const [sort, setSort] = useState<NoteSort>('updated-desc')

  const { notes, isLoading, setStatus, remove, refresh } = useNotes({
    status: 'trashed',
    search,
    sort,
  })

  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const [isEmptyTrashOpen, setIsEmptyTrashOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAction = async (action: NoteCardAction, note: Note) => {
    try {
      if (action === 'open') {
        navigate(`/notes/${note.id}`)
      } else if (action === 'restore') {
        await setStatus(note.id, 'active')
        notify('success', 'Note restored')
      } else if (action === 'delete') {
        setNoteToDelete(note)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed'
      notify('error', 'Error', message)
    }
  }

  const handleConfirmDeleteSingle = async () => {
    if (!noteToDelete) return
    setIsDeleting(true)
    try {
      await remove(noteToDelete.id)
      notify('success', 'Note permanently deleted')
      setNoteToDelete(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      notify('error', 'Error', message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmEmptyTrash = async () => {
    setIsDeleting(true)
    try {
      const allTrashedNotes = await notesService.list({ status: 'trashed' })
      for (const note of allTrashedNotes) {
        await notesService.remove(note.id)
      }
      await refresh()
      notify('success', 'Trash emptied')
      setIsEmptyTrashOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Empty trash failed'
      notify('error', 'Error', message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading && notes.length === 0) {
    return <NoteGridSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Trash</h1>
          <p className="text-body-md text-on-surface-variant">
            Items in trash can be restored or permanently deleted
          </p>
        </div>
        <div className="flex items-center gap-3">
          {notes.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsEmptyTrashOpen(true)}
              className="text-error border-error hover:bg-error hover:text-on-error"
            >
              Empty Trash
            </Button>
          )}
          <NoteFilters value={sort} onChange={setSort} />
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon="delete"
          title={search ? `No trashed notes matching "${search}"` : 'Trash is empty'}
          description={
            search
              ? 'Try adjusting your search filter.'
              : 'Notes deleted from your workspace will appear here before being permanently removed.'
          }
        />
      ) : (
        <NoteGrid
          notes={notes}
          actions={['restore', 'delete']}
          onAction={handleAction}
        />
      )}

      {noteToDelete && (
        <ConfirmDialog
          open={true}
          title="Delete Note Permanently"
          description={`Are you sure you want to permanently delete "${noteToDelete.title}"? This action cannot be undone.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete Permanently'}
          onConfirm={handleConfirmDeleteSingle}
          onCancel={() => setNoteToDelete(null)}
        />
      )}

      {isEmptyTrashOpen && (
        <ConfirmDialog
          open={true}
          title="Empty Trash"
          description="Are you sure you want to permanently delete all items in your trash? This action cannot be undone."
          confirmLabel={isDeleting ? 'Deleting...' : 'Empty Trash'}
          onConfirm={handleConfirmEmptyTrash}
          onCancel={() => setIsEmptyTrashOpen(false)}
        />
      )}
    </div>
  )
}
