import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/*
 * `muted` carries a background the mockup leaves transparent. Outlined over the
 * page surface it measures 4.40:1 — just under AA — and on
 * `surface-container-lowest` it clears at 4.63:1 without changing the look.
 */
const TONES = {
  neutral: 'bg-surface-variant text-on-surface-variant',
  accent: 'bg-secondary-container text-on-secondary-container',
  muted: 'border border-glass-stroke bg-surface-container-lowest text-muted-green',
} as const

export type BadgeTone = keyof typeof TONES

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
