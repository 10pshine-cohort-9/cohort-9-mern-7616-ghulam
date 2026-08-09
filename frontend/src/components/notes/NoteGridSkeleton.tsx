import { Skeleton } from '../ui'

/** Enough to fill the two-column grid twice over without implying a real count. */
const PLACEHOLDERS = [0, 1, 2, 3]

export function NoteGridSkeleton() {
  return (
    // The Skeleton primitive hides itself from assistive technology, so the
    // announcement has to come from here.
    <div
      aria-busy="true"
      aria-label="Loading your notes"
      className="grid gap-gutter lg:grid-cols-2"
      role="status"
    >
      {PLACEHOLDERS.map((index) => (
        <div className="glass-panel flex flex-col gap-4 rounded-xxl p-8" key={index}>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-4 h-3 w-24" />
        </div>
      ))}
    </div>
  )
}
