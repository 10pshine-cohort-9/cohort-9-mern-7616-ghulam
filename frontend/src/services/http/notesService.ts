import type { Note, NoteInput, NoteQuery, NoteStatus } from '../../types'
import type { NotesService } from '../types'
import { request } from './client'

type PatchAction = 'status' | 'pin' | 'favourite'

function toQueryString(query: NoteQuery): string {
  const params = new URLSearchParams()

  if (query.status !== undefined && query.status !== 'active') {
    params.set('status', query.status)
  }
  if (query.favouritesOnly === true) {
    params.set('favouritesOnly', 'true')
  }
  if (query.search !== undefined && query.search.trim() !== '') {
    params.set('search', query.search)
  }
  if (query.sort !== undefined && query.sort !== 'updated-desc') {
    params.set('sort', query.sort)
  }

  const serialised = params.toString()
  return serialised === '' ? '' : `?${serialised}`
}

function notePath(id: string, action?: PatchAction): string {
  const base = `/notes/${encodeURIComponent(id)}`
  return action === undefined ? base : `${base}/${action}`
}

export class HttpNotesService implements NotesService {
  list(query: NoteQuery = {}): Promise<Note[]> {
    return request<Note[]>(`/notes${toQueryString(query)}`)
  }

  get(id: string): Promise<Note> {
    return request<Note>(notePath(id))
  }

  create(input: NoteInput): Promise<Note> {
    return request<Note>('/notes', { method: 'POST', body: input })
  }

  update(id: string, input: Partial<NoteInput>): Promise<Note> {
    return request<Note>(notePath(id), { method: 'PUT', body: input })
  }

  async remove(id: string): Promise<void> {
    await request<undefined>(notePath(id), { method: 'DELETE' })
  }

  setStatus(id: string, status: NoteStatus): Promise<Note> {
    return this.patch(id, 'status', { status })
  }

  setPinned(id: string, isPinned: boolean): Promise<Note> {
    return this.patch(id, 'pin', { isPinned })
  }

  setFavourite(id: string, isFavourite: boolean): Promise<Note> {
    return this.patch(id, 'favourite', { isFavourite })
  }

  private patch(id: string, action: PatchAction, body: unknown): Promise<Note> {
    return request<Note>(notePath(id, action), { method: 'PATCH', body })
  }
}
