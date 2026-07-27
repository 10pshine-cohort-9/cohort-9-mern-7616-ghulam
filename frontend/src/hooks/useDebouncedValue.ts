import { useEffect, useState } from 'react'

/**
 * Trails `value` by `delayMs`, resetting the timer on every change. The search
 * field uses it so typing a word queries once instead of once per keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
