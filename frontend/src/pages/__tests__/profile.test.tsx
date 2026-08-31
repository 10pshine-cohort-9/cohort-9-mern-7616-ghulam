import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/ThemeContext'
import type { Note, NoteQuery } from '../../types'
import { Profile } from '../Profile'

const getCurrentUser = jest.fn()
const logout = jest.fn()
const list = jest.fn()

jest.mock('../../services', () => ({
  authService: {
    getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
    login: jest.fn(),
    register: jest.fn(),
    logout: (...args: unknown[]) => logout(...args),
  },
  notesService: { list: (...args: unknown[]) => list(...args) },
}))

const ADA = {
  id: '1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  createdAt: '2026-01-15T00:00:00.000Z',
}

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: '1',
    userId: 'u1',
    title: 'Groceries',
    content: '<p>Milk</p>',
    status: 'active',
    isPinned: false,
    isFavourite: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  } as Note
}

function serve(counts: { active: number; archived: number; trashed: number }) {
  const build = (count: number, status: Note['status']) =>
    Array.from({ length: count }, (_, index) =>
      makeNote({ id: `${status}-${index}`, status }),
    )

  list.mockImplementation((query: NoteQuery) => {
    if (query.status === 'archived') return Promise.resolve(build(counts.archived, 'archived'))
    if (query.status === 'trashed') return Promise.resolve(build(counts.trashed, 'trashed'))
    return Promise.resolve(build(counts.active, 'active'))
  })
}

function renderProfile() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  document.documentElement.classList.remove('dark')
  window.localStorage.clear()
  getCurrentUser.mockReset().mockResolvedValue(ADA)
  logout.mockReset().mockResolvedValue(undefined)
  list.mockReset().mockResolvedValue([])
})

describe('Profile', () => {
  it('renders nothing at all while there is no signed-in user', async () => {
    getCurrentUser.mockResolvedValue(null)
    const { container } = renderProfile()

    await waitFor(() => expect(getCurrentUser).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the account name and email', async () => {
    serve({ active: 0, archived: 0, trashed: 0 })
    renderProfile()

    expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })

  it('builds initials from the first two name parts', async () => {
    serve({ active: 0, archived: 0, trashed: 0 })
    renderProfile()

    expect(await screen.findByText('AL')).toBeInTheDocument()
  })

  it('reports the month and year the account was created', async () => {
    serve({ active: 0, archived: 0, trashed: 0 })
    renderProfile()

    expect(await screen.findByText('Member since January 2026')).toBeInTheDocument()
  })

  it('totals the three status queries rather than reading one', async () => {
    serve({ active: 3, archived: 2, trashed: 1 })
    renderProfile()

    await screen.findByRole('heading', { name: 'Ada Lovelace' })
    await waitFor(() => expect(screen.getByText('6')).toBeInTheDocument())
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('reports a statistics failure instead of showing zeroes', async () => {
    list.mockRejectedValue(new Error('Network unreachable'))
    renderProfile()

    expect(await screen.findByText('Failed to load statistics.')).toBeInTheDocument()
  })

  it('names the active theme and offers the other one', async () => {
    serve({ active: 0, archived: 0, trashed: 0 })
    renderProfile()

    expect(await screen.findByText('light mode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Switch to Dark/ })).toBeInTheDocument()
  })

  it('switches the theme when the toggle is used', async () => {
    serve({ active: 0, archived: 0, trashed: 0 })
    renderProfile()
    await userEvent.click(await screen.findByRole('button', { name: /Switch to Dark/ }))

    expect(await screen.findByText('dark mode')).toBeInTheDocument()
    expect(document.documentElement).toHaveClass('dark')
    expect(screen.getByRole('button', { name: /Switch to Light/ })).toBeInTheDocument()
  })

  it('signs out through the auth service', async () => {
    serve({ active: 0, archived: 0, trashed: 0 })
    renderProfile()

    await userEvent.click(await screen.findByRole('button', { name: /Sign Out/ }))

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1))
  })
})
