import { expect } from 'chai'
import { Note } from '../src/models/Note.js'
import {
  createNote,
  getNote,
  listNotes,
  removeNote,
  updateNote,
} from '../src/services/notes.service.js'
import { makeNote, makeUser, rejects } from './factories.js'

async function readContentText(id: string): Promise<string | undefined> {
  const note = await Note.findById(id).select('+contentText')
  return note?.contentText
}

describe('createNote', () => {
  it('creates a note owned by the given user', async () => {
    const user = await makeUser()
    const note = await createNote(user.id, { title: 'Title', content: '<p>Body</p>' })

    expect(note.userId).to.equal(user.id)
    expect(note.title).to.equal('Title')
    expect(note.status).to.equal('active')
    expect(note.isPinned).to.equal(false)
    expect(note.isFavourite).to.equal(false)
  })

  it('derives contentText from the content', async () => {
    const user = await makeUser()
    const note = await createNote(user.id, {
      title: 'Title',
      content: '<p>first</p><p>second</p>',
    })

    expect(await readContentText(note.id)).to.equal('first second')
  })

  it('never returns contentText to the caller', async () => {
    const user = await makeUser()
    const note = await createNote(user.id, { title: 'Title', content: '<p>Body</p>' })

    expect(note).to.not.have.property('contentText')
  })

  it('trims the title', async () => {
    const user = await makeUser()
    const note = await createNote(user.id, { title: '  Spaced  ', content: '' })

    expect(note.title).to.equal('Spaced')
  })
})

describe('updateNote', () => {
  it('updates the title and the content', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)
    const updated = await updateNote(user.id, note.id, {
      title: 'New title',
      content: '<p>New body</p>',
    })

    expect(updated.title).to.equal('New title')
    expect(updated.content).to.equal('<p>New body</p>')
  })

  it('refreshes contentText when the content changes', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id, { content: '<p>original</p>' })

    await updateNote(user.id, note.id, { content: '<p>replaced</p>' })

    expect(await readContentText(note.id)).to.equal('replaced')
  })

  it('leaves contentText alone when only the title changes', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id, { content: '<p>original</p>' })

    await updateNote(user.id, note.id, { title: 'Renamed' })

    expect(await readContentText(note.id)).to.equal('original')
  })

  it('does change updatedAt, unlike the lifecycle writes', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    await new Promise((resolve) => setTimeout(resolve, 10))
    const updated = await updateNote(user.id, note.id, { content: '<p>changed</p>' })

    expect(updated.updatedAt).to.not.equal(note.updatedAt)
  })
})

describe('ownership', () => {
  it('returns 404 rather than 403 for a note owned by someone else', async () => {
    const owner = await makeUser()
    const stranger = await makeUser()
    const note = await makeNote(owner.id)

    const error = await rejects(getNote(stranger.id, note.id))
    expect(error.status).to.equal(404)
    expect(error.message).to.equal('Note not found.')
  })

  it('returns 404 for a malformed object id rather than a cast error', async () => {
    const user = await makeUser()

    const error = await rejects(getNote(user.id, 'not-an-object-id'))
    expect(error.status).to.equal(404)
    expect(error.message).to.equal('Note not found.')
  })

  it('refuses to update a note owned by someone else', async () => {
    const owner = await makeUser()
    const stranger = await makeUser()
    const note = await makeNote(owner.id, { title: 'Original' })

    const error = await rejects(updateNote(stranger.id, note.id, { title: 'Hijacked' }))
    expect(error.status).to.equal(404)
    expect((await getNote(owner.id, note.id)).title).to.equal('Original')
  })

  it('refuses to delete a note owned by someone else and leaves it in place', async () => {
    const owner = await makeUser()
    const stranger = await makeUser()
    const note = await makeNote(owner.id)

    const error = await rejects(removeNote(stranger.id, note.id))
    expect(error.status).to.equal(404)
    expect((await getNote(owner.id, note.id)).id).to.equal(note.id)
  })

  it('removes a note the caller owns', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    await removeNote(user.id, note.id)

    expect((await rejects(getNote(user.id, note.id))).status).to.equal(404)
  })
})

describe('listNotes', () => {
  it('lists only notes belonging to the requesting user', async () => {
    const owner = await makeUser()
    const stranger = await makeUser()
    await makeNote(owner.id, { title: 'Mine' })
    await makeNote(stranger.id, { title: 'Theirs' })

    const notes = await listNotes(owner.id)
    expect(notes).to.have.length(1)
    expect(notes[0]?.title).to.equal('Mine')
  })

  it('defaults to active notes only', async () => {
    const user = await makeUser()
    const active = await makeNote(user.id, { title: 'Active' })
    const archived = await makeNote(user.id, { title: 'Archived' })
    await Note.updateOne({ _id: archived.id }, { $set: { status: 'archived' } })

    const notes = await listNotes(user.id)
    expect(notes.map((note) => note.id)).to.deep.equal([active.id])
  })

  it('filters by status', async () => {
    const user = await makeUser()
    await makeNote(user.id, { title: 'Active' })
    const trashed = await makeNote(user.id, { title: 'Trashed' })
    await Note.updateOne({ _id: trashed.id }, { $set: { status: 'trashed' } })

    const notes = await listNotes(user.id, { status: 'trashed' })
    expect(notes.map((note) => note.title)).to.deep.equal(['Trashed'])
  })

  it('filters to favourites only', async () => {
    const user = await makeUser()
    await makeNote(user.id, { title: 'Plain' })
    const favourite = await makeNote(user.id, { title: 'Favourite' })
    await Note.updateOne({ _id: favourite.id }, { $set: { isFavourite: true } })

    const notes = await listNotes(user.id, { favouritesOnly: true })
    expect(notes.map((note) => note.title)).to.deep.equal(['Favourite'])
  })

  it('searches the title case-insensitively', async () => {
    const user = await makeUser()
    await makeNote(user.id, { title: 'Groceries' })
    await makeNote(user.id, { title: 'Meeting notes' })

    const notes = await listNotes(user.id, { search: 'grocer' })
    expect(notes.map((note) => note.title)).to.deep.equal(['Groceries'])
  })

  it('searches contentText rather than the raw HTML', async () => {
    const user = await makeUser()
    await makeNote(user.id, { title: 'Formatted', content: '<p><strong>bold</strong> text</p>' })

    expect(await listNotes(user.id, { search: 'bold' })).to.have.length(1)
    expect(await listNotes(user.id, { search: 'strong' })).to.have.length(0)
  })

  it('escapes regex metacharacters in the search term', async () => {
    const user = await makeUser()
    await makeNote(user.id, { title: 'Plain title' })

    for (const term of ['(', ')', '[', ']', '*', '+', '?', '^', '$', '|', '.', '\\']) {
      expect(await listNotes(user.id, { search: term })).to.have.length(0)
    }
  })

  it('matches a literal metacharacter when the note really contains it', async () => {
    const user = await makeUser()
    await makeNote(user.id, { title: 'Budget (2026)' })

    expect(await listNotes(user.id, { search: '(2026)' })).to.have.length(1)
  })

  it('ignores a blank search term', async () => {
    const user = await makeUser()
    await makeNote(user.id)

    expect(await listNotes(user.id, { search: '   ' })).to.have.length(1)
  })

  it('orders pinned notes first regardless of sort', async () => {
    const user = await makeUser()
    const first = await makeNote(user.id, { title: 'First' })
    await makeNote(user.id, { title: 'Second' })
    await Note.updateOne({ _id: first.id }, { $set: { isPinned: true } })

    for (const sort of ['updated-desc', 'updated-asc', 'created-desc', 'created-asc'] as const) {
      const notes = await listNotes(user.id, { sort })
      expect(notes[0]?.title, `sort=${sort}`).to.equal('First')
    }
  })

  it('honours the created-asc and created-desc sorts', async () => {
    const user = await makeUser()
    const older = await makeNote(user.id, { title: 'Older' })
    await new Promise((resolve) => setTimeout(resolve, 10))
    const newer = await makeNote(user.id, { title: 'Newer' })

    const ascending = await listNotes(user.id, { sort: 'created-asc' })
    const descending = await listNotes(user.id, { sort: 'created-desc' })

    expect(ascending.map((note) => note.id)).to.deep.equal([older.id, newer.id])
    expect(descending.map((note) => note.id)).to.deep.equal([newer.id, older.id])
  })
})
