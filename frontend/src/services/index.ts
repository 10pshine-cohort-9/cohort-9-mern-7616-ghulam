import { HttpAuthService } from './http/authService'
import { HttpNotesService } from './http/notesService'
import type { AuthService, NotesService } from './types'

export const authService: AuthService = new HttpAuthService()
export const notesService: NotesService = new HttpNotesService()

export * from './types'
