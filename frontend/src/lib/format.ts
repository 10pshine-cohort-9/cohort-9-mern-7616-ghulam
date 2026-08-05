const MINUTE = 60_000
const HOUR = 60 * MINUTE

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/**
 * The relative strings the note cards show: "Just now", "12m ago", "5h ago",
 * "Yesterday", then an absolute date.
 *
 * "Yesterday" is decided by calendar day rather than by a 24-hour window —
 * something saved at 23:00 and read at 08:00 is yesterday to a reader, even
 * though it is nine hours old.
 */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''

  const now = new Date()
  const elapsed = now.getTime() - then.getTime()

  // A timestamp slightly in the future means clock skew, not a real interval.
  if (elapsed < MINUTE) return 'Just now'
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`

  const dayGap = Math.round((startOfDay(now) - startOfDay(then)) / 86_400_000)
  if (dayGap === 0) return `${Math.floor(elapsed / HOUR)}h ago`
  if (dayGap === 1) return 'Yesterday'

  return then.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    // Only worth the space once the year stops being obvious.
    year: then.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  })
}
