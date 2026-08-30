import { expect } from 'chai'
import {
  getNote,
  setFavourite,
  setPinned,
  setStatus,
  updateNote,
} from '../src/services/notes.service.js'
import { makeNote, makeUser, rejects } from './factories.js'

const CLOCK_GAP_MS = 15

function pause(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, CLOCK_GAP_MS))
}

describe('setStatus', () => {
  it('moves a note to archived and back to active', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    expect((await setStatus(user.id, note.id, 'archived')).status).to.equal('archived')
    expect((await setStatus(user.id, note.id, 'active')).status).to.equal('active')
  })

  it('moves a note to trashed', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    expect((await setStatus(user.id, note.id, 'trashed')).status).to.equal('trashed')
  })
})

describe('setPinned', () => {
  it('pins and unpins a note', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    expect((await setPinned(user.id, note.id, true)).isPinned).to.equal(true)
    expect((await setPinned(user.id, note.id, false)).isPinned).to.equal(false)
  })
})

describe('setFavourite', () => {
  it('favourites and unfavourites a note', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    expect((await setFavourite(user.id, note.id, true)).isFavourite).to.equal(true)
    expect((await setFavourite(user.id, note.id, false)).isFavourite).to.equal(false)
  })
})

describe('lifecycle writes and updatedAt', () => {
  it('setStatus does not change updatedAt', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    await pause()
    const changed = await setStatus(user.id, note.id, 'archived')

    expect(changed.updatedAt).to.equal(note.updatedAt)
  })

  it('setPinned does not change updatedAt', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    await pause()
    const changed = await setPinned(user.id, note.id, true)

    expect(changed.updatedAt).to.equal(note.updatedAt)
  })

  it('setFavourite does not change updatedAt', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    await pause()
    const changed = await setFavourite(user.id, note.id, true)

    expect(changed.updatedAt).to.equal(note.updatedAt)
  })

  it('leaves updatedAt untouched across three consecutive flag changes', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    await pause()
    await setPinned(user.id, note.id, true)
    await pause()
    await setFavourite(user.id, note.id, true)
    await pause()
    await setStatus(user.id, note.id, 'archived')

    expect((await getNote(user.id, note.id)).updatedAt).to.equal(note.updatedAt)
  })

  it('still bumps updatedAt for a real content edit', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    await pause()
    const edited = await updateNote(user.id, note.id, { content: '<p>changed</p>' })

    expect(edited.updatedAt).to.not.equal(note.updatedAt)
  })

  it('never changes createdAt', async () => {
    const user = await makeUser()
    const note = await makeNote(user.id)

    await pause()
    const changed = await setPinned(user.id, note.id, true)

    expect(changed.createdAt).to.equal(note.createdAt)
  })
})

describe('lifecycle ownership', () => {
  it('refuses every lifecycle write on a note owned by someone else', async () => {
    const owner = await makeUser()
    const stranger = await makeUser()
    const note = await makeNote(owner.id)

    expect((await rejects(setStatus(stranger.id, note.id, 'archived'))).status).to.equal(404)
    expect((await rejects(setPinned(stranger.id, note.id, true))).status).to.equal(404)
    expect((await rejects(setFavourite(stranger.id, note.id, true))).status).to.equal(404)

    const untouched = await getNote(owner.id, note.id)
    expect(untouched.status).to.equal('active')
    expect(untouched.isPinned).to.equal(false)
    expect(untouched.isFavourite).to.equal(false)
  })

  it('returns 404 for a malformed id on every lifecycle write', async () => {
    const user = await makeUser()

    expect((await rejects(setStatus(user.id, 'not-an-id', 'archived'))).status).to.equal(404)
    expect((await rejects(setPinned(user.id, 'not-an-id', true))).status).to.equal(404)
    expect((await rejects(setFavourite(user.id, 'not-an-id', true))).status).to.equal(404)
  })

  it('returns 404 for an id that is valid but absent', async () => {
    const user = await makeUser()

    expect((await rejects(setPinned(user.id, '507f1f77bcf86cd799439011', true))).status).to.equal(
      404,
    )
  })
})
