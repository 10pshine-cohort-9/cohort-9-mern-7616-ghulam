import { render, screen, waitFor } from '@testing-library/react'
import type { RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import { NotFound } from '../NotFound'
import { SignIn } from '../SignIn'
import { SignUp } from '../SignUp'

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
  notesService: { list: jest.fn().mockResolvedValue([]) },
}))

const ADA = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01T00:00:00.000Z' }

function renderPage(page: ReactElement, path = '/signin'): RenderResult {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route element={page} path={path} />
          <Route element={<p>Signed in home</p>} path="/" />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  getCurrentUser.mockReset().mockResolvedValue(null)
  login.mockReset()
  register.mockReset()
  logout.mockReset()
})

describe('SignIn', () => {
  it('renders the form once the session check settles', async () => {
    renderPage(<SignIn />)

    expect(await screen.findByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('surfaces both field errors on an empty submit', async () => {
    renderPage(<SignIn />)
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter a password.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('does not disable the submit button for an invalid form', async () => {
    renderPage(<SignIn />)
    const submit = await screen.findByRole('button', { name: 'Continue' })

    expect(submit).toBeEnabled()
  })

  it('validates a field on blur', async () => {
    renderPage(<SignIn />)
    const email = await screen.findByLabelText('Email address')

    await userEvent.type(email, 'not-an-email')
    await userEvent.tab()

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
  })

  it('clears a field error as soon as the field is edited again', async () => {
    renderPage(<SignIn />)
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }))
    expect(await screen.findByText('Enter your email address.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Email address'), 'a')

    await waitFor(() =>
      expect(screen.queryByText('Enter your email address.')).not.toBeInTheDocument(),
    )
  })

  it('calls login once with the entered credentials', async () => {
    login.mockResolvedValue(undefined)
    renderPage(<SignIn />)

    await userEvent.type(await screen.findByLabelText('Email address'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1))
    expect(login).toHaveBeenCalledWith('ada@example.com', 'password123')
  })

  it('shows the exact message the service rejected with', async () => {
    login.mockRejectedValue(new Error('Incorrect email or password.'))
    renderPage(<SignIn />)

    await userEvent.type(await screen.findByLabelText('Email address'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.')
  })

  it('redirects an already signed-in visitor away from the form', async () => {
    getCurrentUser.mockResolvedValue(ADA)
    renderPage(<SignIn />)

    expect(await screen.findByText('Signed in home')).toBeInTheDocument()
  })
})

describe('SignUp', () => {
  it('surfaces every field error on an empty submit', async () => {
    renderPage(<SignUp />, '/signup')
    await userEvent.click(await screen.findByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it('blocks submission when the confirmation does not match', async () => {
    renderPage(<SignUp />, '/signup')

    await userEvent.type(await screen.findByLabelText('Name'), 'Ada Lovelace')
    await userEvent.type(screen.getByLabelText('Email address'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'different123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Both passwords must match.')).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it('calls register once on a valid submit', async () => {
    register.mockResolvedValue(undefined)
    renderPage(<SignUp />, '/signup')

    await userEvent.type(await screen.findByLabelText('Name'), 'Ada Lovelace')
    await userEvent.type(screen.getByLabelText('Email address'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(register).toHaveBeenCalledTimes(1))
    expect(register).toHaveBeenCalledWith('Ada Lovelace', 'ada@example.com', 'password123')
  })

  it('shows the duplicate-email message from the service', async () => {
    register.mockRejectedValue(new Error('An account with that email already exists.'))
    renderPage(<SignUp />, '/signup')

    await userEvent.type(await screen.findByLabelText('Name'), 'Ada Lovelace')
    await userEvent.type(screen.getByLabelText('Email address'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with that email already exists.',
    )
  })
})

describe('NotFound', () => {
  it('renders the lost-page heading and a way home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Lost in Aether' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'BACK TO HOME' })).toHaveAttribute('href', '/')
  })
})
