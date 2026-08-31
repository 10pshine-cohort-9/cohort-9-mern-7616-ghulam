import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/ThemeContext'
import { ToastProvider } from '../../context/ToastContext'
import { AppShell } from '../layout/AppShell'
import { Sidebar } from '../layout/Sidebar'
import { ThemeToggle } from '../layout/ThemeToggle'
import { TopBar } from '../layout/TopBar'

const getCurrentUser = jest.fn()
const logout = jest.fn()

jest.mock('../../services', () => ({
  authService: {
    getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
    login: jest.fn(),
    register: jest.fn(),
    logout: (...args: unknown[]) => logout(...args),
  },
  notesService: { list: jest.fn().mockResolvedValue([]) },
}))

const ADA = {
  id: '1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  createdAt: '2026-01-15T00:00:00.000Z',
}

function LocationProbe() {
  const location = useLocation()
  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>
}

function withProviders(children: React.ReactNode, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            {children}
            <LocationProbe />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  document.documentElement.classList.remove('dark')
  window.localStorage.clear()
  getCurrentUser.mockReset().mockResolvedValue(ADA)
  logout.mockReset().mockResolvedValue(undefined)
})

describe('Sidebar', () => {
  it('renders nothing while nobody is signed in', async () => {
    getCurrentUser.mockResolvedValue(null)
    withProviders(<Sidebar />)

    await waitFor(() => expect(getCurrentUser).toHaveBeenCalled())
    expect(screen.queryByRole('link', { name: /Dashboard/ })).not.toBeInTheDocument()
  })

  it('links to every section of the workspace', async () => {
    withProviders(<Sidebar />)

    expect(await screen.findByRole('link', { name: /Dashboard/ })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Favourites/ })).toHaveAttribute('href', '/favourites')
    expect(screen.getByRole('link', { name: /Archived/ })).toHaveAttribute('href', '/archived')
    expect(screen.getByRole('link', { name: /Trash/ })).toHaveAttribute('href', '/trash')
  })

  it('marks the current section as the active page', async () => {
    withProviders(<Sidebar />, '/trash')

    expect(await screen.findByRole('link', { name: /Trash/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('leaves Dashboard inactive while another section is open', async () => {
    withProviders(<Sidebar />, '/trash')

    await screen.findByRole('link', { name: /Trash/ })
    expect(screen.getByRole('link', { name: /Dashboard/ })).not.toHaveAttribute('aria-current')
  })

  it('shows the account name, email and initials', async () => {
    withProviders(<Sidebar />)

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('signs out through the auth service', async () => {
    withProviders(<Sidebar />)

    await userEvent.click(await screen.findByRole('button', { name: /Sign out/ }))

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1))
  })

  it('reports a failed sign-out instead of leaving the click silent', async () => {
    logout.mockRejectedValue(new Error('Network unreachable'))
    withProviders(<Sidebar />)

    await userEvent.click(await screen.findByRole('button', { name: /Sign out/ }))

    expect(await screen.findByText('Could not sign out')).toBeInTheDocument()
  })

  it('tells the drawer to close when a link is followed', async () => {
    const onNavigate = jest.fn()
    withProviders(<Sidebar onNavigate={onNavigate} />)

    await userEvent.click(await screen.findByRole('link', { name: /Favourites/ }))

    expect(onNavigate).toHaveBeenCalled()
  })
})

describe('ThemeToggle', () => {
  it('names the theme the press will switch to, not the current one', async () => {
    withProviders(<ThemeToggle />)

    expect(
      await screen.findByRole('button', { name: 'Switch to dark theme' }),
    ).toBeInTheDocument()
  })

  it('switches the theme and re-labels itself', async () => {
    withProviders(<ThemeToggle />)

    await userEvent.click(await screen.findByRole('button', { name: 'Switch to dark theme' }))

    expect(
      await screen.findByRole('button', { name: 'Switch to light theme' }),
    ).toBeInTheDocument()
    expect(document.documentElement).toHaveClass('dark')
  })
})

describe('TopBar', () => {
  it('writes the search term into the query string', async () => {
    withProviders(<TopBar onOpenNav={jest.fn()} />)

    await userEvent.type(screen.getByLabelText('Search notes'), 'milk')

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/?q=milk'))
  })

  it('drops the parameter entirely when the field is cleared', async () => {
    withProviders(<TopBar onOpenNav={jest.fn()} />, '/?q=milk')
    const field = screen.getByLabelText('Search notes')
    expect(field).toHaveValue('milk')

    await userEvent.clear(field)

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/))
  })

  it('asks the shell to open the drawer', async () => {
    const onOpenNav = jest.fn()
    withProviders(<TopBar onOpenNav={onOpenNav} />)

    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }))

    expect(onOpenNav).toHaveBeenCalledTimes(1)
  })

  it('sends the new-note button to the editor route', async () => {
    withProviders(<TopBar onOpenNav={jest.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /New note/ }))

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/notes/new'))
  })
})

describe('AppShell', () => {
  function renderShell(path = '/') {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <Routes>
                <Route element={<AppShell />} path="/">
                  <Route element={<p>Dashboard content</p>} index />
                </Route>
              </Routes>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </MemoryRouter>,
    )
  }

  it('renders the routed screen inside the frame', async () => {
    renderShell()

    expect(await screen.findByText('Dashboard content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument()
  })

  it('keeps the navigation drawer closed until it is asked for', async () => {
    renderShell()

    await screen.findByText('Dashboard content')
    expect(screen.getByLabelText('Navigation')).not.toHaveAttribute('open')
  })

  it('opens the drawer from the top bar', async () => {
    renderShell()
    await screen.findByText('Dashboard content')

    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }))

    await waitFor(() => expect(screen.getByLabelText('Navigation')).toHaveAttribute('open'))
  })

  it('closes the open drawer when the layout reaches the rail breakpoint', async () => {
    const listeners: ((event: MediaQueryListEvent) => void)[] = []
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
          listeners.push(listener),
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    })

    renderShell()
    await screen.findByText('Dashboard content')
    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
    await waitFor(() => expect(screen.getByLabelText('Navigation')).toHaveAttribute('open'))

    for (const listener of listeners) listener({ matches: true } as MediaQueryListEvent)

    await waitFor(() =>
      expect(screen.getByLabelText('Navigation')).not.toHaveAttribute('open'),
    )
  })
})
