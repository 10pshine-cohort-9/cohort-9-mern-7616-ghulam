import { cn } from '../../lib/cn'
import { Icon, type IconName } from './Icon'

/*
 * The mockup draws the accent as a 4px left border. Tailwind emits the width
 * utility before `glass-panel`, whose `border` shorthand then resets it to 1px,
 * so a `before` pseudo-element paints the rail instead and never competes for
 * the same property.
 */
const TONES = {
  success: { rail: 'before:bg-primary', text: 'text-primary', icon: 'check_circle' },
  error: { rail: 'before:bg-error', text: 'text-error', icon: 'warning' },
} as const satisfies Record<string, { rail: string; text: string; icon: IconName }>

export type ToastTone = keyof typeof TONES

interface ToastProps {
  tone: ToastTone
  title: string
  description?: string
  onDismiss: () => void
}

export function Toast({ tone, title, description, onDismiss }: ToastProps) {
  const { rail, text, icon } = TONES[tone]

  return (
    <div
      // An error interrupts; a success confirms. Matching the live-region
      // politeness to that difference is the whole point of having two tones.
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'glass-panel toast-in relative flex items-start gap-4 rounded-xl p-4',
        'before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-xl',
        rail,
      )}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon className={cn('mt-0.5', text)} name={icon} />
      <div className="flex-1">
        <p className={cn('text-label-sm font-semibold', text)}>{title}</p>
        {description && <p className="text-[12px] text-on-surface-variant">{description}</p>}
      </div>
      <button
        aria-label="Dismiss notification"
        className="rounded-full p-1 text-on-surface-variant transition-colors duration-200 ease-out hover:bg-secondary/10 hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={onDismiss}
        type="button"
      >
        <Icon name="close" size="sm" />
      </button>
    </div>
  )
}
