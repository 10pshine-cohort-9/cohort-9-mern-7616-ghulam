import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RichTextEditor } from '../components/editor/RichTextEditor'
import { Button, ConfirmDialog, EmptyState, Skeleton } from '../components/ui'
import { useToast } from '../context/ToastContext'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import { notesService } from '../services'
import type { Note } from '../types'

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const { notify } = useToast()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [initialNote, setInitialNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (isNew) {
      setTitle('')
      setContent('')
      setInitialNote(null)
      setIsLoading(false)
      setNotFound(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setNotFound(false)

    notesService
      .get(id)
      .then((note) => {
        if (!isMounted) return
        setTitle(note.title)
        setContent(note.content)
        setInitialNote(note)
      })
      .catch(() => {
        if (!isMounted) return
        setNotFound(true)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, isNew])

  const hasUnsavedChanges = isNew
    ? Boolean(title.trim() || content.trim())
    : Boolean(initialNote && (title !== initialNote.title || content !== initialNote.content))

  const blocker = useUnsavedChanges(hasUnsavedChanges)

  const handleSave = async () => {
    const finalTitle = title.trim() || 'Untitled Note'
    setIsSaving(true)
    try {
      if (isNew) {
        await notesService.create({ title: finalTitle, content })
        notify('success', 'Note created successfully')
      } else if (id) {
        await notesService.update(id, { title: finalTitle, content })
        notify('success', 'Note updated successfully')
      }
      navigate('/', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save note'
      notify('error', 'Error', message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Discard unsaved changes?')) {
        navigate(-1)
      }
    } else {
      navigate(-1)
    }
  }

  if (isLoading) {
    return (
      <div className="p-stack-md max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-3/4 rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="py-stack-lg">
        <EmptyState
          icon="description"
          title="Note Not Found"
          description="The note you are looking for does not exist or has been removed."
          action={<Button onClick={() => navigate('/')}>Return to Dashboard</Button>}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-glass-stroke">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="w-full text-headline-lg font-bold bg-transparent text-on-surface placeholder:text-muted-green focus:outline-none"
        />
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            Save Note
          </Button>
        </div>
      </div>

      <RichTextEditor value={content} onChange={setContent} />

      {blocker.state === 'blocked' && (
        <ConfirmDialog
          open={true}
          title="Unsaved Changes"
          description="You have unsaved changes in this note. Discard them and leave?"
          confirmLabel="Discard & Leave"
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}
    </div>
  )
}
