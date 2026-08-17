import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { Icon } from '../ui/Icon'

export function SearchField() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [term, setTerm] = useState(initialQuery)
  const debouncedTerm = useDebouncedValue(term, 250)

  useEffect(() => {
    setTerm(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    const currentQ = searchParams.get('q') || ''
    if (debouncedTerm === currentQ) return

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (debouncedTerm.trim()) {
          next.set('q', debouncedTerm.trim())
        } else {
          next.delete('q')
        }
        return next
      },
      { replace: true }
    )
  }, [debouncedTerm, searchParams, setSearchParams])

  return (
    <div className="relative w-full max-w-md">
      <Icon
        name="search"
        size="sm"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-green pointer-events-none"
      />
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search notes..."
        className="w-full pl-9 pr-8 py-2 bg-surface-container-lowest border border-glass-stroke rounded-full text-body-md text-on-surface placeholder:text-muted-green focus:outline-none focus:border-primary transition-colors"
      />
      {term && (
        <button
          type="button"
          onClick={() => setTerm('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-green hover:text-on-surface rounded-full"
          aria-label="Clear search"
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  )
}
