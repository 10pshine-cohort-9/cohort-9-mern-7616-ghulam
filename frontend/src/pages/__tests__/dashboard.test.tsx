import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '../../context/ToastContext'
import type { Note, NoteQuery } from '../../types'
import type { NotesService } from '../../services/types'
import { Dashboard } from '../Dashboard'

const list = jest.fn<ReturnType<NotesService['list']>, Parameters<NotesService['list']>>()
const setStatus = jest.fn<ReturnType<NotesService['setStatus']>, Parameters<NotesService['setStatus']>>()
const setPinned = jest.fn<ReturnType<NotesService['setPinned']>, Parameters<NotesService['setPinned']>>()
const setFavourite = jest.fn<ReturnType<NotesService['setFavourite']>, Parameters<NotesService['setFavourite']>>()

jest.mock('../../services', () => ({
  authService: { getCurrentUser: jest.fn().mockResolvedValue(null) },
  notesService: {
    list: (...args: Parameters<NotesService['list']>) => list(...args),
    setStatus: (...args: Parameters<NotesService['setStatus']>) => setStatus(...args),
    setPinned: (...args: Parameters<NotesService['setPinned']>) => setPinned(...args),
    setFavourite: (...args: Parameters<NotesService['setFavourite']>) => setFavourite(...args),
  },
}))

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: '1',
    userId: 'u1',
    title: 'Groceries',
    content: '<p>Milk and bread</p>',
    status: 'active',
    isPinned: false,
    isFavourite: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  } as Note
}

function serve(active: Note[], archived: Note[] = []) {
  list.mockImplementation((query?: NoteQuery) => {
    if (query?.status === 'archived') return Promise.resolve(archived)
    const search = query?.search ?? ''
    if (!search) return Promise.resolve(active)
    return Promise.resolve(
      active.filter((note) => note.title.toLowerCase().includes(search.toLowerCase())),
    )
  })
}

function renderDashboard(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <Routes>
          <Route element={<Dashboard />} path="/" />
          <Route element={<p>Editor</p>} path="/notes/new" />
          <Route element={<p>Note detail</p>} path="/notes/:id" />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  list.mockReset()
  setStatus.mockReset().mockResolvedValue(makeNote())
  setPinned.mockReset().mockResolvedValue(makeNote())
  setFavourite.mockReset().mockResolvedValue(makeNote())
})

describe('Dashboard', () => {
  it('invites a first note when the account is empty', async () => {
    serve([])
    renderDashboard()

    expect(await screen.findByText('No notes yet')).toBeInTheDocument()
    expect(screen.getByText('Create note')).toBeInTheDocument()
  })

  it('offers the floating create button alongside the empty state', async () => {
    serve([])
    renderDashboard()

    await screen.findByText('No notes yet')
    expect(screen.getAllByRole('button', { name: 'Create note' })).toHaveLength(2)
  })

  it('shows a dash for recent activity on an account with no notes', async () => {
    serve([])
    renderDashboard()

    await screen.findByText('No notes yet')
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('counts totals, pinned and archived from the unsearched queries', async () => {
    serve(
      [
        makeNote({ id: '1', title: 'First', isPinned: true }),
        makeNote({ id: '2', title: 'Second' }),
        makeNote({ id: '3', title: 'Third' }),
      ],
      [
        makeNote({ id: '4', title: 'Old', status: 'archived' }),
        makeNote({ id: '5', title: 'Older', status: 'archived' }),
      ],
    )
    renderDashboard()

    await screen.findByRole('button', { name: 'First' })
    const tiles = screen.getAllByRole('definition').map((tile) => tile.textContent)
    // Distinct counts, so swapping the pinned and archived tiles fails the test.
    expect(tiles[0]).toBe('3')
    expect(tiles[1]).toBe('1')
    expect(tiles[2]).toBe('2')
  })

  it('leaves the totals alone while the search narrows the grid', async () => {
    serve([
      makeNote({ id: '1', title: 'Groceries' }),
      makeNote({ id: '2', title: 'Recipes' }),
      makeNote({ id: '3', title: 'Ideas' }),
    ])
    renderDashboard('/?q=Groceries')

    await screen.findByRole('button', { name: 'Groceries' })
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Recipes' })).not.toBeInTheDocument(),
    )
    expect(screen.getAllByRole('definition')[0]).toHaveTextContent('3')
  })

  it('reports a search that matches nothing without offering to create a note', async () => {
    serve([makeNote({ id: '1', title: 'Groceries' })])
    renderDashboard('/?q=quantum')

    expect(await screen.findByText('No matches')).toBeInTheDocument()
    expect(screen.getByText('Nothing in your notes matches "quantum".')).toBeInTheDocument()
    expect(screen.queryByText('Create note')).not.toBeInTheDocument()
  })

  it('surfaces a load failure with a way to retry', async () => {
    list.mockRejectedValue(new Error('Network unreachable'))
    renderDashboard()

    expect(await screen.findByText('Could not load your notes')).toBeInTheDocument()
    expect(screen.getByText('Network unreachable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('reloads when the retry button is pressed', async () => {
    list.mockRejectedValue(new Error('Network unreachable'))
    renderDashboard()
    await screen.findByRole('button', { name: 'Try again' })

    serve([makeNote({ id: '1', title: 'Groceries' })])
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('button', { name: 'Groceries' })).toBeInTheDocument()
  })

  it('opens a note when its title is clicked', async () => {
    serve([makeNote({ id: '42', title: 'Groceries' })])
    renderDashboard()

    await userEvent.click(await screen.findByRole('button', { name: 'Groceries' }))

    expect(await screen.findByText('Note detail')).toBeInTheDocument()
  })

  it('sends the create button to the new-note route', async () => {
    serve([])
    renderDashboard()
    await screen.findByText('No notes yet')

    await userEvent.click(screen.getByText('Create note'))

    expect(await screen.findByText('Editor')).toBeInTheDocument()
  })

  it('toggles the pin to the opposite of the current state', async () => {
    serve([makeNote({ id: '7', title: 'Groceries', isPinned: true })])
    renderDashboard()

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Unpin' }))

    await waitFor(() => expect(setPinned).toHaveBeenCalledWith('7', false))
  })

  it('confirms an archive with a toast', async () => {
    serve([makeNote({ id: '7', title: 'Groceries' })])
    renderDashboard()

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Archive' }))

    await waitFor(() => expect(setStatus).toHaveBeenCalledWith('7', 'archived'))
    expect(await screen.findByText('Note archived')).toBeInTheDocument()
  })

  it('confirms a trash with a toast', async () => {
    serve([makeNote({ id: '7', title: 'Groceries' })])
    renderDashboard()

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Move to trash' }))

    await waitFor(() => expect(setStatus).toHaveBeenCalledWith('7', 'trashed'))
    expect(await screen.findByText('Note moved to trash')).toBeInTheDocument()
  })

  it('reports a failed mutation without blanking the list', async () => {
    serve([makeNote({ id: '7', title: 'Groceries' })])
    setStatus.mockRejectedValue(new Error('Server refused'))
    renderDashboard()

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Archive' }))

    expect(await screen.findByText('That did not work')).toBeInTheDocument()
    expect(screen.getByText('Server refused')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Groceries' })).toBeInTheDocument()
  })
})
