import type { RequestHandler } from 'express'
import { AppError } from '../lib/AppError.js'
import { logger } from '../lib/logger.js'
import { optionalString, requireBoolean, requireOneOf, requireString } from '../lib/validate.js'
import { NOTE_STATUSES, type NoteStatus } from '../models/Note.js'
import {
  NOTE_SORTS,
  createNote,
  getNote,
  listNotes,
  removeNote,
  setFavourite,
  setPinned,
  setStatus,
  updateNote,
  type NoteSort,
} from '../services/notes.service.js'

interface NoteParams {
  id: string
}

const TITLE_RULES = { label: 'Title', max: 200 }
const CONTENT_RULES = { label: 'Content', max: 100_000 }

function readSort(value: unknown): NoteSort {
  return typeof value === 'string' && (NOTE_SORTS as readonly string[]).includes(value)
    ? (value as NoteSort)
    : 'updated-desc'
}

function requireUserId(req: { userId?: string }): string {
  if (req.userId === undefined) {
    throw new AppError('You are not signed in.', 401)
  }
  return req.userId
}

export const getNotes: RequestHandler = async (req, res) => {
  const userId = requireUserId(req)
  const status: NoteStatus =
    req.query.status === undefined
      ? 'active'
      : requireOneOf(req.query, 'status', NOTE_STATUSES, 'Status')

  const notes = await listNotes(userId, {
    status,
    favouritesOnly: req.query.favouritesOnly === 'true',
    search: typeof req.query.search === 'string' ? req.query.search : '',
    sort: readSort(req.query.sort),
  })

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

export const patchStatus: RequestHandler<NoteParams> = async (req, res) => {
  const userId = requireUserId(req)
  const status = requireOneOf(req.body, 'status', NOTE_STATUSES, 'Status')

  const note = await setStatus(userId, req.params.id, status)

  logger.info({ userId, noteId: note.id, status }, 'Note status changed')
  res.json({ success: true, data: note })
}

export const patchPin: RequestHandler<NoteParams> = async (req, res) => {
  const userId = requireUserId(req)
  const isPinned = requireBoolean(req.body, 'isPinned', 'isPinned')

  const note = await setPinned(userId, req.params.id, isPinned)

  logger.info({ userId, noteId: note.id, isPinned }, 'Note pin changed')
  res.json({ success: true, data: note })
}

export const patchFavourite: RequestHandler<NoteParams> = async (req, res) => {
  const userId = requireUserId(req)
  const isFavourite = requireBoolean(req.body, 'isFavourite', 'isFavourite')

  const note = await setFavourite(userId, req.params.id, isFavourite)

  logger.info({ userId, noteId: note.id, isFavourite }, 'Note favourite changed')
  res.json({ success: true, data: note })
}
