import { act, renderHook, waitFor } from '@testing-library/react'
import { useDebouncedValue } from '../useDebouncedValue'
import { useNotes } from '../useNotes'

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
