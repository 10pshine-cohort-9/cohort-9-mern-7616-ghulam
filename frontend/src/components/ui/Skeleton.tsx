import { cn } from '../../lib/cn'

interface SkeletonProps {
  className?: string
}

/**
 * A placeholder block. Decorative by itself — the container that swaps it for
 * real content owns the `aria-busy` announcement, so this stays hidden from
 * assistive technology rather than reading out as an empty region.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn('skeleton-shimmer rounded-lg', className)} />
}
