import { LocalAuthService } from './local/authService'
import { LocalNotesService } from './local/notesService'
import type { AuthService, NotesService } from './types'

/*
 * The seam. Once the backend exists these two lines point at HttpAuthService and
 * HttpNotesService and nothing else in the app changes — which is the whole
 * reason the contracts in ./types mirror the REST surface one for one.
 */
export const authService: AuthService = new LocalAuthService()
export const notesService: NotesService = new LocalNotesService()

export * from './types'
