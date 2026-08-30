import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Continue</Button>)

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('calls onClick when enabled', async () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Continue</Button>)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled while loading', () => {
    render(<Button isLoading>Saving</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('marks itself busy while loading', () => {
    render(<Button isLoading>Saving</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('stays disabled when loading and disabled is explicitly false', () => {
    render(
      <Button isLoading disabled={false}>
        Saving
      </Button>,
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not fire onClick while loading', async () => {
    const onClick = jest.fn()
    render(
      <Button isLoading disabled={false} onClick={onClick}>
        Saving
      </Button>,
    )

    await userEvent.click(screen.getByRole('button')).catch(() => undefined)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('is not busy when idle', () => {
    render(<Button>Continue</Button>)

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy')
  })
})

describe('TextField', () => {
  it('associates its label with its input', () => {
    render(<TextField label="Email address" />)

    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
  })

  it('gives each instance a distinct id', () => {
    render(
      <>
        <TextField label="First" />
        <TextField label="Second" />
      </>,
    )

    expect(screen.getByLabelText('First').id).not.toBe(screen.getByLabelText('Second').id)
  })

  it('is not marked invalid without an error', () => {
    render(<TextField label="Email address" />)

    expect(screen.getByLabelText('Email address')).not.toHaveAttribute('aria-invalid')
  })

  it('marks itself invalid and announces the error when one is given', () => {
    render(<TextField label="Email address" error="Enter a valid email address." />)

    const input = screen.getByLabelText('Email address')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
  })

  it('points aria-describedby at the error message', () => {
    render(<TextField label="Email address" error="Enter a valid email address." />)

    const input = screen.getByLabelText('Email address')
    expect(input.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id)
  })

  it('accepts typing', async () => {
    render(<TextField label="Email address" />)

    await userEvent.type(screen.getByLabelText('Email address'), 'ada@example.com')

    expect(screen.getByLabelText('Email address')).toHaveValue('ada@example.com')
  })
})

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Archived</Badge>)

    expect(screen.getByText('Archived')).toBeInTheDocument()
  })
})
