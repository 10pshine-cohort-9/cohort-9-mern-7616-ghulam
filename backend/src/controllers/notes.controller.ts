import type { RequestHandler } from 'express'
import { AppError } from '../lib/AppError.js'
import { logger } from '../lib/logger.js'
import { optionalString, requireString } from '../lib/validate.js'
import {
  createNote,
  getNote,
  listNotes,
  removeNote,
  updateNote,
} from '../services/notes.service.js'

interface NoteParams {
  id: string
}

const TITLE_RULES = { label: 'Title', max: 200 }
const CONTENT_RULES = { label: 'Content', max: 100_000 }

function requireUserId(req: { userId?: string }): string {
  if (req.userId === undefined) {
    throw new AppError('You are not signed in.', 401)
  }
  return req.userId
}

export const getNotes: RequestHandler = async (req, res) => {
  const notes = await listNotes(requireUserId(req))
  res.json({ success: true, data: notes })
}

export const getNoteById: RequestHandler<NoteParams> = async (req, res) => {
  const note = await getNote(requireUserId(req), req.params.id)
  res.json({ success: true, data: note })
}

export const postNote: RequestHandler = async (req, res) => {
  const userId = requireUserId(req)
  const title = requireString(req.body, 'title', TITLE_RULES)
  const content = requireString(req.body, 'content', CONTENT_RULES)

  const note = await createNote(userId, { title, content })

  logger.info({ userId, noteId: note.id }, 'Note created')
  res.status(201).json({ success: true, data: note })
}

export const putNote: RequestHandler<NoteParams> = async (req, res) => {
  const userId = requireUserId(req)
  const title = optionalString(req.body, 'title', TITLE_RULES)
  const content = optionalString(req.body, 'content', CONTENT_RULES)

  const note = await updateNote(userId, req.params.id, { title, content })

  logger.info({ userId, noteId: note.id }, 'Note updated')
  res.json({ success: true, data: note })
}

export const deleteNote: RequestHandler<NoteParams> = async (req, res) => {
  const userId = requireUserId(req)
  await removeNote(userId, req.params.id)

  logger.info({ userId, noteId: req.params.id }, 'Note deleted')
  res.json({ success: true })
}
