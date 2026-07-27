import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from './Icon'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: IconName
  /** Required: an icon-only control has no accessible name without it. */
  label: string
}

export function IconButton({ name, label, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center rounded-full',
        'border border-glass-stroke text-primary',
        // Excludes `outline-color` so the focus ring is instant. See Button.
        'transition-[background-color,color,box-shadow] duration-200 ease-out',
        'hover:bg-surface-container-lowest hover:ambient-shadow',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <Icon name={name} />
    </button>
  )
}
