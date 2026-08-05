import { useCallback, useEffect, useRef, useState } from 'react'
import { notesService } from '../services'
import type { Note, NoteInput, NoteQuery, NoteStatus } from '../types'

/**
 * Loads the notes matching `query` and exposes the mutations against them.
 *
 * Callers pass `query` as an object literal, which is a new reference every
 * render, so the effect keys off its serialised form instead. That is also why
 * the query is parsed back inside `refresh` — closing over the object would
 * capture a stale one whenever the key changed without the callback being
 * recreated.
 */
export function useNotes(query: NoteQuery = {}) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const queryKey = JSON.stringify(query)
  // Only the most recent load may write to state. Debounced search fires
  // overlapping requests, and without this an earlier one landing late would
  // replace the results for the term the user is actually looking at.
  const latestRequest = useRef(0)

  const refresh = useCallback(async () => {
    const requestId = ++latestRequest.current
    setIsLoading(true)

    try {
      const result = await notesService.list(JSON.parse(queryKey) as NoteQuery)
      if (requestId !== latestRequest.current) return
      setNotes(result)
      setError(null)
    } catch (cause) {
      if (requestId !== latestRequest.current) return
      setError(cause instanceof Error ? cause.message : 'Could not load your notes.')
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false)
    }
  }, [queryKey])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // The reload below goes through this rather than the captured `refresh`. A
  // query that changes while a mutation is in flight would otherwise reload
  // the query the user has already left, and that reload — being the later of
  // the two — is the one whose results reach the screen.
  const latestRefresh = useRef(refresh)
  useEffect(() => {
    latestRefresh.current = refresh
  }, [refresh])

  /*
   * Mutations reload the list on success and let failures propagate, so a page
   * can show a Toast. They deliberately do not set `error` — that drives the
   * list's own empty/error state, and a failed rename should not blank out
   * notes that are still on screen.
   */
  const mutate = useCallback(async <T>(operation: Promise<T>): Promise<T> => {
    const result = await operation
    await latestRefresh.current()
    return result
  }, [])

  const create = useCallback(
    (input: NoteInput) => mutate(notesService.create(input)),
    [mutate],
  )

  const update = useCallback(
    (id: string, input: Partial<NoteInput>) => mutate(notesService.update(id, input)),
    [mutate],
  )

  const remove = useCallback((id: string) => mutate(notesService.remove(id)), [mutate])

  const setStatus = useCallback(
    (id: string, status: NoteStatus) => mutate(notesService.setStatus(id, status)),
    [mutate],
  )

  const setPinned = useCallback(
    (id: string, isPinned: boolean) => mutate(notesService.setPinned(id, isPinned)),
    [mutate],
  )

  const setFavourite = useCallback(
    (id: string, isFavourite: boolean) => mutate(notesService.setFavourite(id, isFavourite)),
    [mutate],
  )

  return {
    notes,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
    setStatus,
    setPinned,
    setFavourite,
  }
}
