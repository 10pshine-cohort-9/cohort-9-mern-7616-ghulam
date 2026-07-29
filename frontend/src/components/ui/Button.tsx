import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

/*
 * Primary pairs `bg-primary-container` with `text-on-primary-container`, not
 * `text-on-primary`. The latter reads #013e37 in the dark palette and would put
 * dark green on dark green; the container token is white in light and cream in
 * dark, so this is the one pairing that holds in both.
 *
 * Secondary's hover is per-theme for the same reason: the mockup's
 * `secondary-fixed` is a pale tan that the dark palette's cream text cannot sit
 * on, so dark mode lifts to `surface-container-high` instead.
 */
const VARIANTS = {
  primary:
    'bg-primary-container text-on-primary-container ambient-shadow hover:scale-[1.02] active:scale-[0.99]',
  secondary:
    'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed dark:hover:bg-surface-container-high',
  ghost: 'text-primary hover:bg-secondary/10',
  outline:
    'border border-primary text-primary hover:bg-primary hover:text-on-primary',
  danger: 'bg-error text-on-error hover:brightness-110 active:scale-[0.99]',
} as const

const SIZES = {
  sm: 'px-4 py-2',
  md: 'px-6 py-3',
} as const

export type ButtonVariant = keyof typeof VARIANTS
export type ButtonSize = keyof typeof SIZES

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      // `||`, not `??`: nullish coalescing only falls through on null and
      // undefined, so an explicit `disabled={false}` alongside `isLoading` left
      // the button live mid-request and double-submittable.
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full text-label-sm font-semibold',
        // Named properties rather than `transition-all`: Tailwind's transition
        // lists include `outline-color`, which made the focus ring fade in over
        // 200ms instead of appearing the moment the key lands.
        'transition-[background-color,color,scale,box-shadow,filter] duration-200 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:pointer-events-none',
        // A loading button is disabled, but dimming it makes "Saving" read as
        // unavailable rather than busy. The spinner already says it is working.
        !isLoading && 'disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {isLoading && <Icon name="spinner" size="sm" className="animate-spin" />}
      {children}
    </button>
  )
}
