import { stripHtml } from '../../lib/excerpt'
import { createId } from '../../lib/id'
import type { Note, NoteInput, NoteQuery, NoteSort, NoteStatus } from '../../types'
import { ApiError, type NotesService } from '../types'
import { clone, delay, readNotes, readSessionUserId, writeNotes } from './storage'

const COMPARATORS: Record<NoteSort, (a: Note, b: Note) => number> = {
  'updated-desc': (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  'updated-asc': (a, b) => a.updatedAt.localeCompare(b.updatedAt),
  'created-desc': (a, b) => b.createdAt.localeCompare(a.createdAt),
  'created-asc': (a, b) => a.createdAt.localeCompare(b.createdAt),
}

/** Mirrors the backend's auth middleware rejecting an unauthenticated request. */
function requireUserId(): string {
  const userId = readSessionUserId()
  if (userId === null) throw new ApiError('You are not signed in.', 401)
  return userId
}

/**
 * Finds a note the current user owns, or throws.
 *
 * A note belonging to someone else is reported as 404, not 403 — a 403 would
 * confirm that the id exists. The backend follows the same rule, so this is the
 * behaviour the UI is being built against.
 */
function indexOfOwned(notes: Note[], id: string, userId: string): number {
  const index = notes.findIndex((note) => note.id === id && note.userId === userId)
  if (index === -1) throw new ApiError('Note not found.', 404)
  return index
}

function matchesSearch(note: Note, term: string): boolean {
  const needle = term.trim().toLowerCase()
  if (!needle) return true
  return (
    note.title.toLowerCase().includes(needle) ||
    stripHtml(note.content).toLowerCase().includes(needle)
  )
}

export class LocalNotesService implements NotesService {
  async list(query: NoteQuery = {}): Promise<Note[]> {
    await delay()
    const userId = requireUserId()

    const { status = 'active', favouritesOnly = false, search = '', sort = 'updated-desc' } = query

    const filtered = readNotes().filter(
      (note) =>
        note.userId === userId &&
        note.status === status &&
        (!favouritesOnly || note.isFavourite) &&
        matchesSearch(note, search),
    )

    // Pinned notes lead regardless of the chosen sort; the sort orders within
    // each group.
    filtered.sort(
      (a, b) => Number(b.isPinned) - Number(a.isPinned) || COMPARATORS[sort](a, b),
    )

    return clone(filtered)
  }

  async get(id: string): Promise<Note> {
    await delay()
    const userId = requireUserId()
    const notes = readNotes()
    return clone(notes[indexOfOwned(notes, id, userId)])
  }

  async create(input: NoteInput): Promise<Note> {
    await delay()
    const userId = requireUserId()

    const timestamp = new Date().toISOString()
    const note: Note = {
      id: createId(),
      userId,
      title: input.title.trim(),
      content: input.content,
      status: 'active',
      isPinned: false,
      isFavourite: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    writeNotes([...readNotes(), note])
    return clone(note)
  }

  async update(id: string, input: Partial<NoteInput>): Promise<Note> {
    await delay()
    const userId = requireUserId()

    const notes = readNotes()
    const index = indexOfOwned(notes, id, userId)
    const updated: Note = {
      ...notes[index],
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.content !== undefined && { content: input.content }),
      updatedAt: new Date().toISOString(),
    }

    notes[index] = updated
    writeNotes(notes)
    return clone(updated)
  }

  async remove(id: string): Promise<void> {
    await delay()
    const userId = requireUserId()

    const notes = readNotes()
    indexOfOwned(notes, id, userId)
    writeNotes(notes.filter((note) => note.id !== id))
  }

  setStatus(id: string, status: NoteStatus): Promise<Note> {
    return this.applyFlags(id, { status })
  }

  setPinned(id: string, isPinned: boolean): Promise<Note> {
    return this.applyFlags(id, { isPinned })
  }

  setFavourite(id: string, isFavourite: boolean): Promise<Note> {
    return this.applyFlags(id, { isFavourite })
  }

  /**
   * Lifecycle changes deliberately leave `updatedAt` alone. The cards read it as
   * "edited", and under the default sort a bump would jump a note to the top of
   * the list for being pinned or favourited rather than for being changed.
   */
  private async applyFlags(
    id: string,
    changes: Partial<Pick<Note, 'status' | 'isPinned' | 'isFavourite'>>,
  ): Promise<Note> {
    await delay()
    const userId = requireUserId()

    const notes = readNotes()
    const index = indexOfOwned(notes, id, userId)
    const updated: Note = { ...notes[index], ...changes }

    notes[index] = updated
    writeNotes(notes)
    return clone(updated)
  }
}
