import type { Note, NoteInput, NoteQuery, NoteStatus, User } from '../types'

/**
 * Carries the HTTP status the backend will return, so pages can branch on it
 * today and behave identically once the transport is real.
 */
export class ApiError extends Error {
  // Declared and assigned rather than a constructor parameter property:
  // `erasableSyntaxOnly` is on in tsconfig.app.json, and a parameter property
  // emits real code instead of erasing, so it is rejected.
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface AuthService {
  register(name: string, email: string, password: string): Promise<User>
  login(email: string, password: string): Promise<User>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
}

export interface NotesService {
  list(query?: NoteQuery): Promise<Note[]>
  get(id: string): Promise<Note>
  create(input: NoteInput): Promise<Note>
  update(id: string, input: Partial<NoteInput>): Promise<Note>
  /**
   * Hard delete, matching `DELETE /api/notes/:id`. Moving a note to the bin is
   * `setStatus(id, 'trashed')` — a different operation, kept distinct so the
   * backend does not have to guess which one a caller meant.
   */
  remove(id: string): Promise<void>
  setStatus(id: string, status: NoteStatus): Promise<Note>
  setPinned(id: string, isPinned: boolean): Promise<Note>
  setFavourite(id: string, isFavourite: boolean): Promise<Note>
}
