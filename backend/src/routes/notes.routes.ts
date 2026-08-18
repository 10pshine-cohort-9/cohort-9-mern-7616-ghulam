import { Router } from 'express'
import {
  deleteNote,
  getNoteById,
  getNotes,
  patchFavourite,
  patchPin,
  patchStatus,
  postNote,
  putNote,
} from '../controllers/notes.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const notesRouter: Router = Router()

notesRouter.use(requireAuth)

notesRouter.get('/', getNotes)
notesRouter.post('/', postNote)
notesRouter.get('/:id', getNoteById)
notesRouter.put('/:id', putNote)
notesRouter.delete('/:id', deleteNote)

notesRouter.patch('/:id/status', patchStatus)
notesRouter.patch('/:id/pin', patchPin)
notesRouter.patch('/:id/favourite', patchFavourite)
