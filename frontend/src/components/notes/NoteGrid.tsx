import type { Note } from '../../types'
import { NoteCard, type NoteCardAction } from './NoteCard'

interface NoteGridProps {
  notes: readonly Note[]
  actions: readonly NoteCardAction[]
  onAction: (action: NoteCardAction, note: Note) => void
}

export function NoteGrid({ notes, actions, onAction }: NoteGridProps) {
  return (
    <div className="grid gap-gutter lg:grid-cols-2">
      {notes.map((note) => (
        <NoteCard actions={actions} key={note.id} note={note} onAction={onAction} />
      ))}
    </div>
  )
}
