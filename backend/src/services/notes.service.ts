import { isValidObjectId, type SortOrder } from 'mongoose'
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

export const NOTE_SORTS = ['updated-desc', 'updated-asc', 'created-desc', 'created-asc'] as const

export type NoteSort = (typeof NOTE_SORTS)[number]

export interface NoteQuery {
  status?: NoteStatus
  favouritesOnly?: boolean
  search?: string
  sort?: NoteSort
}

interface NoteFilter {
  userId: string
  status: NoteStatus
  isFavourite?: boolean
  $or?: { title?: RegExp; contentText?: RegExp }[]
}

const SORT_ORDER: Record<NoteSort, Record<string, SortOrder>> = {
  'updated-desc': { updatedAt: -1 },
  'updated-asc': { updatedAt: 1 },
  'created-desc': { createdAt: -1 },
  'created-asc': { createdAt: 1 },
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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

export async function listNotes(userId: string, query: NoteQuery = {}): Promise<PublicNote[]> {
  const { status = 'active', favouritesOnly = false, search = '', sort = 'updated-desc' } = query

  const filter: NoteFilter = { userId, status }
  if (favouritesOnly) {
    filter.isFavourite = true
  }

  const term = search.trim()
  if (term !== '') {
    const pattern = new RegExp(escapeRegex(term), 'i')
    filter.$or = [{ title: pattern }, { contentText: pattern }]
  }

  const notes = await Note.find(filter).sort({ isPinned: -1, ...SORT_ORDER[sort] })
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

async function applyFlags(
  userId: string,
  id: string,
  changes: Partial<Pick<PublicNote, 'status' | 'isPinned' | 'isFavourite'>>,
): Promise<PublicNote> {
  if (!isValidObjectId(id)) {
    throw new AppError('Note not found.', 404)
  }

  const note = await Note.findOneAndUpdate(
    { _id: id, userId },
    { $set: changes },
    { new: true, timestamps: false },
  )

  if (note === null) {
    throw new AppError('Note not found.', 404)
  }
  return toPublicNote(note)
}

export function setStatus(userId: string, id: string, status: NoteStatus): Promise<PublicNote> {
  return applyFlags(userId, id, { status })
}

export function setPinned(userId: string, id: string, isPinned: boolean): Promise<PublicNote> {
  return applyFlags(userId, id, { isPinned })
}

export function setFavourite(
  userId: string,
  id: string,
  isFavourite: boolean,
): Promise<PublicNote> {
  return applyFlags(userId, id, { isFavourite })
}
