import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '../../services/types'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../../routes/ProtectedRoute'
import { AuthProvider, useAuth } from '../AuthContext'
import { ThemeProvider, useTheme } from '../ThemeContext'
import { ToastProvider, useToast } from '../ToastContext'

const getCurrentUser = jest.fn()
const login = jest.fn()
const register = jest.fn()
const logout = jest.fn()

jest.mock('../../services', () => ({
  authService: {
    getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
    login: (...args: unknown[]) => login(...args),
    register: (...args: unknown[]) => register(...args),
    logout: (...args: unknown[]) => logout(...args),
  },
}))

const ADA = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01T00:00:00.000Z' }

function Consumer() {
  const auth = useAuth()

  return (
    <div>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="user">{auth.user?.name ?? 'none'}</span>
      <button onClick={() => void auth.login('ada@example.com', 'password123')} type="button">
        Sign in
      </button>
      <button onClick={() => void auth.logout()} type="button">
        Sign out
      </button>
    </div>
  )
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  )
}

beforeEach(() => {
  getCurrentUser.mockReset()
  login.mockReset()
  register.mockReset()
  logout.mockReset()
})

describe('AuthProvider bootstrap', () => {
  it('restores a signed-in session', async () => {
    getCurrentUser.mockResolvedValue(ADA)
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('Ada')
  })

  it('settles signed out when there is no session', async () => {
    getCurrentUser.mockResolvedValue(null)
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('clears isLoading when the api is unreachable', async () => {
    getCurrentUser.mockRejectedValue(new ApiError('Cannot reach the server.', 0))
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('does not leave the rejection unhandled', async () => {
    const unhandled = jest.fn()
    process.on('unhandledRejection', unhandled)

    getCurrentUser.mockRejectedValue(new ApiError('Cannot reach the server.', 0))
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    await new Promise((resolve) => setTimeout(resolve, 20))

    process.off('unhandledRejection', unhandled)
    expect(unhandled).not.toHaveBeenCalled()
  })

  it('asks the server exactly once', async () => {
    getCurrentUser.mockResolvedValue(null)
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(getCurrentUser).toHaveBeenCalledTimes(1)
  })
})

describe('AuthProvider actions', () => {
  it('sets the user on login', async () => {
    getCurrentUser.mockResolvedValue(null)
    login.mockResolvedValue(ADA)
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Ada'))
  })

  it('clears the user on logout', async () => {
    getCurrentUser.mockResolvedValue(ADA)
    logout.mockResolvedValue(undefined)
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Ada'))
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'))
  })
})

describe('useAuth', () => {
  it('throws when used outside the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Consumer />)).toThrow('useAuth must be used inside an AuthProvider.')

    consoleError.mockRestore()
  })
})

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  function ThemeConsumer() {
    const { theme, toggle } = useTheme()

    return (
      <div>
        <span data-testid="theme">{theme}</span>
        <button onClick={toggle} type="button">
          Toggle
        </button>
      </div>
    )
  }

  function renderTheme() {
    return render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
  }

  it('reads the theme back from the class the boot script applied', () => {
    document.documentElement.classList.add('dark')
    renderTheme()

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('defaults to light when the boot script applied no class', () => {
    renderTheme()

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('writes nothing to storage until the user picks a theme', () => {
    renderTheme()

    expect(localStorage.getItem('aether.theme')).toBeNull()
  })

  it('persists the choice once toggled', async () => {
    renderTheme()

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(localStorage.getItem('aether.theme')).toBe('dark')
  })

  it('applies the dark class to the document element', async () => {
    renderTheme()

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))

    expect(document.documentElement).toHaveClass('dark')
  })

  it('throws when used outside the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<ThemeConsumer />)).toThrow('useTheme must be used inside a ThemeProvider.')

    consoleError.mockRestore()
  })
})

describe('ToastProvider', () => {
  function ToastConsumer() {
    const { notify } = useToast()

    return (
      <button onClick={() => notify('success', 'Note saved', 'All good')} type="button">
        Notify
      </button>
    )
  }

  it('shows a toast when notify is called', async () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Notify' }))

    expect(await screen.findByText('Note saved')).toBeInTheDocument()
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('stacks more than one toast', async () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Notify' }))
    await userEvent.click(screen.getByRole('button', { name: 'Notify' }))

    expect(await screen.findAllByText('Note saved')).toHaveLength(2)
  })

  it('throws when used outside the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<ToastConsumer />)).toThrow()

    consoleError.mockRestore()
  })
})

describe('ProtectedRoute', () => {
  function renderGuard() {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<p>Private area</p>} path="/" />
            </Route>
            <Route element={<p>Sign in screen</p>} path="/signin" />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
  }

  it('renders nothing while the session is being restored', () => {
    getCurrentUser.mockReturnValue(new Promise(() => {}))
    renderGuard()

    expect(screen.queryByText('Private area')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign in screen')).not.toBeInTheDocument()
  })

  it('lets a signed-in user through', async () => {
    getCurrentUser.mockResolvedValue(ADA)
    renderGuard()

    expect(await screen.findByText('Private area')).toBeInTheDocument()
  })

  it('redirects a signed-out visitor to the sign-in screen', async () => {
    getCurrentUser.mockResolvedValue(null)
    renderGuard()

    expect(await screen.findByText('Sign in screen')).toBeInTheDocument()
  })
})
