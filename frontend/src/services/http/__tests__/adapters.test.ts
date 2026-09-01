import { ApiError } from '../../types'
import { HttpAuthService } from '../authService'
import { HttpNotesService } from '../notesService'

const requestMock = jest.fn()

jest.mock('../client', () => ({
  request: (...args: unknown[]) => requestMock(...args),
}))

beforeEach(() => {
  requestMock.mockReset()
  requestMock.mockResolvedValue(undefined)
})

describe('HttpAuthService', () => {
  const auth = new HttpAuthService()

  it('posts registration details', async () => {
    await auth.register('Ada', 'ada@example.com', 'password123')

    expect(requestMock).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: { name: 'Ada', email: 'ada@example.com', password: 'password123' },
    })
  })

  it('posts login details', async () => {
    await auth.login('ada@example.com', 'password123')

    expect(requestMock).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'ada@example.com', password: 'password123' },
    })
  })

  it('posts to logout', async () => {
    await auth.logout()

    expect(requestMock).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
  })

  it('returns the user from getCurrentUser', async () => {
    requestMock.mockResolvedValue({ id: '1', name: 'Ada' })

    await expect(auth.getCurrentUser()).resolves.toEqual({ id: '1', name: 'Ada' })
  })

  it('returns null when getCurrentUser hits a 401', async () => {
    requestMock.mockRejectedValue(new ApiError('You are not signed in.', 401))

    await expect(auth.getCurrentUser()).resolves.toBeNull()
  })

  it('rethrows a server fault rather than silently signing the user out', async () => {
    requestMock.mockRejectedValue(new ApiError('Something went wrong.', 500))

    await expect(auth.getCurrentUser()).rejects.toBeInstanceOf(ApiError)
  })

  it('rethrows an unreachable server rather than treating it as signed out', async () => {
    requestMock.mockRejectedValue(new ApiError('Cannot reach the server.', 0))

    await expect(auth.getCurrentUser()).rejects.toBeInstanceOf(ApiError)
  })
})

describe('HttpNotesService query strings', () => {
  const notes = new HttpNotesService()

  it('omits every default parameter', async () => {
    await notes.list()

    expect(requestMock).toHaveBeenCalledWith('/notes')
  })

  it('omits parameters explicitly set to their defaults', async () => {
    await notes.list({ status: 'active', sort: 'updated-desc', search: '  ', favouritesOnly: false })

    expect(requestMock).toHaveBeenCalledWith('/notes')
  })

  it('includes a non-default status', async () => {
    await notes.list({ status: 'archived' })

    expect(requestMock).toHaveBeenCalledWith('/notes?status=archived')
  })

  it('includes favouritesOnly only when true', async () => {
    await notes.list({ favouritesOnly: true })

    expect(requestMock).toHaveBeenCalledWith('/notes?favouritesOnly=true')
  })

  it('includes a search term', async () => {
    await notes.list({ search: 'groceries' })

    expect(requestMock).toHaveBeenCalledWith('/notes?search=groceries')
  })

  it('includes a non-default sort', async () => {
    await notes.list({ sort: 'created-asc' })

    expect(requestMock).toHaveBeenCalledWith('/notes?sort=created-asc')
  })
})

describe('HttpNotesService verbs and paths', () => {
  const notes = new HttpNotesService()

  it('gets one note', async () => {
    await notes.get('abc')

    expect(requestMock).toHaveBeenCalledWith('/notes/abc')
  })

  it('encodes an id that needs escaping', async () => {
    await notes.get('a/b')

    expect(requestMock).toHaveBeenCalledWith('/notes/a%2Fb')
  })

  it('posts a new note', async () => {
    await notes.create({ title: 'A note', content: '<p>Body</p>' })

    expect(requestMock).toHaveBeenCalledWith('/notes', {
      method: 'POST',
      body: { title: 'A note', content: '<p>Body</p>' },
    })
  })

  it('puts an update', async () => {
    await notes.update('abc', { title: 'Renamed' })

    expect(requestMock).toHaveBeenCalledWith('/notes/abc', {
      method: 'PUT',
      body: { title: 'Renamed' },
    })
  })

  it('deletes a note', async () => {
    await notes.remove('abc')

    expect(requestMock).toHaveBeenCalledWith('/notes/abc', { method: 'DELETE' })
  })

  it('patches the status', async () => {
    await notes.setStatus('abc', 'archived')

    expect(requestMock).toHaveBeenCalledWith('/notes/abc/status', {
      method: 'PATCH',
      body: { status: 'archived' },
    })
  })

  it('patches the pin', async () => {
    await notes.setPinned('abc', true)

    expect(requestMock).toHaveBeenCalledWith('/notes/abc/pin', {
      method: 'PATCH',
      body: { isPinned: true },
    })
  })

  it('patches the favourite', async () => {
    await notes.setFavourite('abc', false)

    expect(requestMock).toHaveBeenCalledWith('/notes/abc/favourite', {
      method: 'PATCH',
      body: { isFavourite: false },
    })
  })
})
