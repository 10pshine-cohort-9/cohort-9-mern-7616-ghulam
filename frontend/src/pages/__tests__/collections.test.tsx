import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '../../context/ToastContext'
import type { Note, NoteQuery } from '../../types'
import type { NotesService } from '../../services/types'
import { Archived } from '../Archived'
import { Favourites } from '../Favourites'
import { Trash } from '../Trash'

const list = jest.fn<ReturnType<NotesService['list']>, Parameters<NotesService['list']>>()
const remove = jest.fn<ReturnType<NotesService['remove']>, Parameters<NotesService['remove']>>()
const setStatus = jest.fn<ReturnType<NotesService['setStatus']>, Parameters<NotesService['setStatus']>>()
const setPinned = jest.fn<ReturnType<NotesService['setPinned']>, Parameters<NotesService['setPinned']>>()
const setFavourite = jest.fn<ReturnType<NotesService['setFavourite']>, Parameters<NotesService['setFavourite']>>()

jest.mock('../../services', () => ({
  authService: { getCurrentUser: jest.fn().mockResolvedValue(null) },
  notesService: {
    list: (...args: Parameters<NotesService['list']>) => list(...args),
    remove: (...args: Parameters<NotesService['remove']>) => remove(...args),
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

function renderPage(page: ReactElement, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <Routes>
          <Route element={page} path="/" />
          <Route element={<p>Note detail</p>} path="/notes/:id" />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  list.mockReset().mockResolvedValue([])
  remove.mockReset().mockResolvedValue(undefined)
  setStatus.mockReset().mockResolvedValue(makeNote())
  setPinned.mockReset().mockResolvedValue(makeNote())
  setFavourite.mockReset().mockResolvedValue(makeNote())
})

describe('Favourites', () => {
  it('asks the API for active favourites only', async () => {
    renderPage(<Favourites />)

    await screen.findByRole('heading', { name: 'Favourites' })
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active', favouritesOnly: true }),
    )
  })

  it('explains the empty state when nothing is starred', async () => {
    renderPage(<Favourites />)

    expect(await screen.findByText('No favourited notes')).toBeInTheDocument()
  })

  it('names the search term in the empty state', async () => {
    renderPage(<Favourites />, '/?q=quantum')

    expect(await screen.findByText('No favourite notes matching "quantum"')).toBeInTheDocument()
  })

  it('re-queries with the sort the user picked', async () => {
    list.mockResolvedValue([makeNote({ isFavourite: true })])
    renderPage(<Favourites />)
    await screen.findByRole('button', { name: 'Groceries' })

    await userEvent.click(screen.getByRole('button', { name: 'Created (Oldest)' }))

    await waitFor(() =>
      expect(list).toHaveBeenCalledWith(expect.objectContaining({ sort: 'created-asc' })),
    )
  })

  it('unfavourites a note from its menu', async () => {
    list.mockResolvedValue([makeNote({ id: '9', isFavourite: true })])
    renderPage(<Favourites />)

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Remove from favourites' }))

    await waitFor(() => expect(setFavourite).toHaveBeenCalledWith('9', false))
  })

  it('reports a load failure', async () => {
    list.mockRejectedValue(new Error('Network unreachable'))
    renderPage(<Favourites />)

    expect(await screen.findByText('Error Loading Favourites')).toBeInTheDocument()
  })
})

describe('Archived', () => {
  it('asks the API for archived notes', async () => {
    renderPage(<Archived />)

    await screen.findByRole('heading', { name: 'Archived Notes' })
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ status: 'archived' }))
  })

  it('explains the empty state', async () => {
    renderPage(<Archived />)

    expect(await screen.findByText('No archive found')).toBeInTheDocument()
  })

  it('offers restore and trash but never archive again', async () => {
    list.mockResolvedValue([makeNote({ status: 'archived' })])
    renderPage(<Archived />)

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))

    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move to trash' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
  })

  it('restores a note back to active and says so', async () => {
    list.mockResolvedValue([makeNote({ id: '5', status: 'archived' })])
    renderPage(<Archived />)

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Restore' }))

    await waitFor(() => expect(setStatus).toHaveBeenCalledWith('5', 'active'))
    expect(await screen.findByText('Note restored to dashboard')).toBeInTheDocument()
  })

  it('reports a failed restore', async () => {
    list.mockResolvedValue([makeNote({ id: '5', status: 'archived' })])
    setStatus.mockRejectedValue(new Error('Server refused'))
    renderPage(<Archived />)

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Restore' }))

    expect(await screen.findByText('Server refused')).toBeInTheDocument()
  })
})

describe('Trash', () => {
  it('asks the API for trashed notes', async () => {
    renderPage(<Trash />)

    await screen.findByRole('heading', { name: 'Trash' })
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ status: 'trashed' }))
  })

  it('hides Empty Trash while the bin is empty', async () => {
    renderPage(<Trash />)

    expect(await screen.findByText('Trash is empty')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Empty Trash' })).not.toBeInTheDocument()
  })

  it('offers Empty Trash once something is in it', async () => {
    list.mockResolvedValue([makeNote({ status: 'trashed' })])
    renderPage(<Trash />)

    expect(await screen.findByRole('button', { name: 'Empty Trash' })).toBeInTheDocument()
  })

  it('names the note in the permanent-delete confirmation', async () => {
    list.mockResolvedValue([makeNote({ id: '3', title: 'Groceries', status: 'trashed' })])
    renderPage(<Trash />)

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }))

    expect(await screen.findByText('Delete Note Permanently')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Are you sure you want to permanently delete "Groceries"? This action cannot be undone.',
      ),
    ).toBeInTheDocument()
  })

  it('does not delete anything until the dialog is confirmed', async () => {
    list.mockResolvedValue([makeNote({ id: '3', status: 'trashed' })])
    renderPage(<Trash />)

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }))
    await screen.findByText('Delete Note Permanently')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(remove).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(screen.queryByText('Delete Note Permanently')).not.toBeInTheDocument(),
    )
  })

  it('deletes the note once confirmed', async () => {
    list.mockResolvedValue([makeNote({ id: '3', status: 'trashed' })])
    renderPage(<Trash />)

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }))
    await screen.findByText('Delete Note Permanently')
    await userEvent.click(screen.getByRole('button', { name: 'Delete Permanently' }))

    await waitFor(() => expect(remove).toHaveBeenCalledWith('3'))
    expect(await screen.findByText('Note permanently deleted')).toBeInTheDocument()
  })

  it('removes every trashed note when the bin is emptied', async () => {
    const trashed = [
      makeNote({ id: '1', title: 'One', status: 'trashed' }),
      makeNote({ id: '2', title: 'Two', status: 'trashed' }),
    ]
    list.mockImplementation((query?: NoteQuery) =>
      Promise.resolve(query?.status === 'trashed' ? trashed : []),
    )
    renderPage(<Trash />)

    await userEvent.click(await screen.findByRole('button', { name: 'Empty Trash' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Empty Trash' }))

    await waitFor(() => expect(remove).toHaveBeenCalledTimes(2))
    expect(remove).toHaveBeenCalledWith('1')
    expect(remove).toHaveBeenCalledWith('2')
    expect(await screen.findByText('Trash emptied')).toBeInTheDocument()
  })

  it('reports a failed permanent delete', async () => {
    list.mockResolvedValue([makeNote({ id: '3', status: 'trashed' })])
    remove.mockRejectedValue(new Error('Server refused'))
    renderPage(<Trash />)

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }))
    await screen.findByText('Delete Note Permanently')
    await userEvent.click(screen.getByRole('button', { name: 'Delete Permanently' }))

    expect(await screen.findByText('Server refused')).toBeInTheDocument()
  })

  it('restores a note out of the trash', async () => {
    list.mockResolvedValue([makeNote({ id: '3', status: 'trashed' })])
    renderPage(<Trash />)

    await userEvent.click(await screen.findByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Restore' }))

    await waitFor(() => expect(setStatus).toHaveBeenCalledWith('3', 'active'))
    expect(await screen.findByText('Note restored')).toBeInTheDocument()
  })
})
