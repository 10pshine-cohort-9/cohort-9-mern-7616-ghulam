import { cn } from '../cn'
import { excerpt, stripHtml } from '../excerpt'
import { formatRelativeTime } from '../format'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useNotes } from '../../hooks/useNotes'
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from '../validation'

describe('validateName', () => {
  it('accepts a normal name', () => {
    expect(validateName('Ada Lovelace')).toBeNull()
  })

  it('rejects a blank name', () => {
    expect(validateName('   ')).toBe('Enter your name.')
  })

  it('rejects a name over 60 characters', () => {
    expect(validateName('x'.repeat(61))).toBe('Keep your name under 60 characters.')
  })

  it('accepts a name at exactly 60 characters', () => {
    expect(validateName('x'.repeat(60))).toBeNull()
  })
})

describe('validateEmail', () => {
  it('accepts a normal address', () => {
    expect(validateEmail('ada@example.com')).toBeNull()
  })

  it('rejects a blank address', () => {
    expect(validateEmail('  ')).toBe('Enter your email address.')
  })

  it('rejects an address with no dot in the domain', () => {
    expect(validateEmail('ada@example')).toBe('Enter a valid email address.')
  })

  it('rejects an address with no at sign', () => {
    expect(validateEmail('ada.example.com')).toBe('Enter a valid email address.')
  })
})

describe('validatePassword', () => {
  it('accepts eight characters', () => {
    expect(validatePassword('12345678')).toBeNull()
  })

  it('rejects seven characters with the shared message', () => {
    expect(validatePassword('1234567')).toBe('Use at least 8 characters.')
  })

  it('rejects a blank password', () => {
    expect(validatePassword('')).toBe('Enter a password.')
  })
})

describe('validatePasswordConfirmation', () => {
  it('accepts a match', () => {
    expect(validatePasswordConfirmation('password123', 'password123')).toBeNull()
  })

  it('rejects a mismatch', () => {
    expect(validatePasswordConfirmation('password123', 'different')).toBe(
      'Both passwords must match.',
    )
  })

  it('rejects a blank confirmation', () => {
    expect(validatePasswordConfirmation('password123', '')).toBe('Re-enter your password.')
  })
})

describe('stripHtml', () => {
  it('separates paragraphs so words do not run together', () => {
    expect(stripHtml('<p>one</p><p>two</p>')).toBe('one two')
  })

  it('separates list items', () => {
    expect(stripHtml('<ul><li>one</li><li>two</li></ul>')).toBe('one two')
  })

  it('removes script text rather than leaving it searchable', () => {
    expect(stripHtml('<p>hi</p><script>alert(1)</script>')).toBe('hi')
  })

  it('removes style text', () => {
    expect(stripHtml('<style>.a{color:red}</style><p>hi</p>')).toBe('hi')
  })

  it('collapses runs of whitespace', () => {
    expect(stripHtml('<p>a     b</p>')).toBe('a b')
  })
})

describe('excerpt', () => {
  it('returns short text unchanged', () => {
    expect(excerpt('<p>Short note</p>')).toBe('Short note')
  })

  it('truncates on a word boundary rather than mid-word', () => {
    const result = excerpt(`<p>${'word '.repeat(60)}</p>`, 20)

    expect(result.endsWith('…')).toBe(true)
    expect(result.replace('…', '').trimEnd().endsWith('word')).toBe(true)
  })

  it('truncates a single over-long word with no boundary to fall back on', () => {
    expect(excerpt(`<p>${'x'.repeat(50)}</p>`, 10)).toBe(`${'x'.repeat(10)}…`)
  })
})

describe('formatRelativeTime', () => {
  it('returns an empty string for an unparseable value', () => {
    expect(formatRelativeTime('not-a-date')).toBe('')
  })

  it('reads a moment ago as Just now', () => {
    expect(formatRelativeTime(new Date(Date.now() - 5_000).toISOString())).toBe('Just now')
  })

  it('reads minutes', () => {
    expect(formatRelativeTime(new Date(Date.now() - 12 * 60_000).toISOString())).toBe('12m ago')
  })

  it('reads hours within the same calendar day', () => {
    const now = new Date()
    if (now.getHours() < 3) {
      return
    }
    expect(formatRelativeTime(new Date(Date.now() - 2 * 3_600_000).toISOString())).toBe('2h ago')
  })

  it('treats the previous calendar day as Yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(12, 0, 0, 0)

    expect(formatRelativeTime(yesterday.toISOString())).toBe('Yesterday')
  })
})

describe('cn', () => {
  it('merges conflicting padding so the later class wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('keeps a custom text-size token alongside a colour class', () => {
    const result = cn('text-label-sm', 'text-muted-green')

    expect(result).toContain('text-label-sm')
    expect(result).toContain('text-muted-green')
  })

  it('still lets one custom size override another', () => {
    expect(cn('text-label-sm', 'text-body-lg')).toBe('text-body-lg')
  })

  it('drops falsy values', () => {
    expect(cn('p-2', false, undefined, null)).toBe('p-2')
  })
})

const list = jest.fn()

jest.mock('../../services', () => ({
  notesService: {
    list: (...args: unknown[]) => list(...args),
  },
}))

const NOTE = {
  id: '1',
  userId: 'u1',
  title: 'Groceries',
  content: '<p>Milk</p>',
  status: 'active',
  isPinned: false,
  isFavourite: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('first', 250))

    expect(result.current).toBe('first')
  })

  it('does not emit before the delay has elapsed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 250), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })
    act(() => {
      jest.advanceTimersByTime(249)
    })

    expect(result.current).toBe('first')
  })

  it('emits once the delay has elapsed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 250), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })
    act(() => {
      jest.advanceTimersByTime(250)
    })

    expect(result.current).toBe('second')
  })

  it('restarts the timer on every change so only the last value lands', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 250), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'ab' })
    act(() => {
      jest.advanceTimersByTime(200)
    })
    rerender({ value: 'abc' })
    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(result.current).toBe('a')

    act(() => {
      jest.advanceTimersByTime(50)
    })

    expect(result.current).toBe('abc')
  })
})

describe('useNotes', () => {
  beforeEach(() => {
    list.mockReset()
  })

  it('starts loading and then exposes the notes', async () => {
    list.mockResolvedValue([NOTE])

    const { result } = renderHook(() => useNotes())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.notes).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  it('surfaces the message when the query fails', async () => {
    list.mockRejectedValue(new Error('Cannot reach the server.'))

    const { result } = renderHook(() => useNotes())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Cannot reach the server.')
  })

  it('passes the query through to the service', async () => {
    list.mockResolvedValue([])

    const { result } = renderHook(() => useNotes({ status: 'archived' }))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(list).toHaveBeenCalledWith({ status: 'archived' })
  })

  it('does not refetch when the caller passes an equal query literal', async () => {
    list.mockResolvedValue([])

    const { result, rerender } = renderHook(() => useNotes({ status: 'active' }))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    rerender()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(list).toHaveBeenCalledTimes(1)
  })
})
