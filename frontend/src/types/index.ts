export type NoteStatus = 'active' | 'archived' | 'trashed'

export interface Note {
  id: string
  userId: string
  title: string
  /** TipTap HTML. Never render this into a card — use `excerpt()`. */
  content: string
  status: NoteStatus
  isPinned: boolean
  isFavourite: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export type NoteSort = 'updated-desc' | 'updated-asc' | 'created-desc' | 'created-asc'

export interface NoteQuery {
  status?: NoteStatus
  favouritesOnly?: boolean
  search?: string
  sort?: NoteSort
}

export interface NoteInput {
  title: string
  content: string
}
