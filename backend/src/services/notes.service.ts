import { isValidObjectId } from 'mongoose'
import { AppError } from '../lib/AppError.js'
import { toPlainText } from '../lib/html.js'
import { Note, type NoteDocument, type NoteStatus } from '../models/Note.js'

export interface PublicNote {
  id: string
  userId: string
  title: string
  content: string
  status: NoteStatus
  isPinned: boolean
  isFavourite: boolean
  createdAt: string
  updatedAt: string
}

export interface NoteInput {
  title: string
  content: string
}

export function toPublicNote(note: NoteDocument): PublicNote {
  return {
    id: note._id.toString(),
    userId: note.userId.toString(),
    title: note.title,
    content: note.content,
    status: note.status,
    isPinned: note.isPinned,
    isFavourite: note.isFavourite,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }
}

async function getOwned(userId: string, id: string): Promise<NoteDocument> {
  if (!isValidObjectId(id)) {
    throw new AppError('Note not found.', 404)
  }

  const note = await Note.findOne({ _id: id, userId })
  if (note === null) {
    throw new AppError('Note not found.', 404)
  }
  return note
}

export async function listNotes(userId: string): Promise<PublicNote[]> {
  const notes = await Note.find({ userId }).sort({ isPinned: -1, updatedAt: -1 })
  return notes.map(toPublicNote)
}

export async function getNote(userId: string, id: string): Promise<PublicNote> {
  return toPublicNote(await getOwned(userId, id))
}

export async function createNote(userId: string, input: NoteInput): Promise<PublicNote> {
  const note = await Note.create({
    userId,
    title: input.title.trim(),
    content: input.content,
    contentText: toPlainText(input.content),
  })
  return toPublicNote(note)
}

export async function updateNote(
  userId: string,
  id: string,
  input: Partial<NoteInput>,
): Promise<PublicNote> {
  const note = await getOwned(userId, id)

  if (input.title !== undefined) {
    note.title = input.title.trim()
  }
  if (input.content !== undefined) {
    note.content = input.content
    note.contentText = toPlainText(input.content)
  }

  await note.save()
  return toPublicNote(note)
}

export async function removeNote(userId: string, id: string): Promise<void> {
  if (!isValidObjectId(id)) {
    throw new AppError('Note not found.', 404)
  }

  const result = await Note.deleteOne({ _id: id, userId })
  if (result.deletedCount === 0) {
    throw new AppError('Note not found.', 404)
  }
}
