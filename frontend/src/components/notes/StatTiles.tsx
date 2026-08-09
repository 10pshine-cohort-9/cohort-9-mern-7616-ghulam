import { cn } from '../../lib/cn'
import { Icon, type IconName } from '../ui'

interface StatTilesProps {
  total: number
  pinned: number
  archived: number
  /** Relative time of the newest edit, or null on an account with no notes. */
  lastEdited: string | null
}

export function StatTiles({ total, pinned, archived, lastEdited }: StatTilesProps) {
  const tiles = [
    { label: 'Total notes', value: total, icon: 'description' },
    { label: 'Pinned', value: pinned, icon: 'pin' },
    { label: 'Archived', value: archived, icon: 'archive' },
    // A dash rather than "Never": a fresh account has nothing to report, and
    // "Never" reads as a remark about the person using it.
    { label: 'Recent activity', value: lastEdited ?? '—', icon: 'bolt' },
  ] as const satisfies readonly { label: string; value: number | string; icon: IconName }[]

  return (
    <dl className="grid grid-cols-2 gap-gutter md:grid-cols-4">
      {tiles.map((tile) => (
        <div
          className="glass-panel flex h-32 flex-col justify-between rounded-xxl p-6"
          key={tile.label}
        >
          <div className="flex items-start justify-between gap-2">
            <dt className="font-mono text-label-caps text-on-surface-variant uppercase">
              {tile.label}
            </dt>
            <Icon className="shrink-0 text-primary/40" name={tile.icon} size="sm" />
          </div>
          <dd
            className={cn(
              'truncate text-primary',
              // A count fits at the display size; "12 Jan 2026" wraps out of a
              // 128px tile, so the one tile holding a date drops a step.
              typeof tile.value === 'number' ? 'text-headline-lg' : 'text-headline-md',
            )}
          >
            {tile.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
