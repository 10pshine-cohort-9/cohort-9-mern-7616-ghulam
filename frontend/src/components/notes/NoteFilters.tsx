import type { NoteSort } from '../../types'

interface NoteFiltersProps {
  value: NoteSort
  onChange: (sort: NoteSort) => void
}

const SORT_OPTIONS: { label: string; value: NoteSort }[] = [
  { label: 'Updated (Newest)', value: 'updated-desc' },
  { label: 'Updated (Oldest)', value: 'updated-asc' },
  { label: 'Created (Newest)', value: 'created-desc' },
  { label: 'Created (Oldest)', value: 'created-asc' },
]

export function NoteFilters({ value, onChange }: NoteFiltersProps) {
  return (
    <div role="group" aria-label="Sort options" className="flex items-center gap-2 overflow-x-auto py-2">
      <span className="text-label-caps text-muted-green font-mono uppercase tracking-wider text-xs">Sort:</span>
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 rounded-full text-label-sm font-medium transition-all ${
            value === option.value
              ? 'bg-primary-container text-on-primary shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
