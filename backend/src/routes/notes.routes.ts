import { Router } from 'express'
import {
  deleteNote,
  getNoteById,
  getNotes,
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
