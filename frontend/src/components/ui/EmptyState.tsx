import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from './Icon'

interface EmptyStateProps {
  icon: IconName
  title: string
  description: string
  /** Usually a `<Button>`; omitted where the view offers no next step. */
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'glass-panel flex flex-col items-center rounded-xxl p-stack-lg text-center',
        className,
      )}
    >
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-secondary-container opacity-30 blur-2xl" />
        <Icon name={icon} size="xl" className="relative z-10 text-muted-green" />
      </div>
      <h3 className="mb-2 text-headline-md text-primary">{title}</h3>
      <p className={cn('max-w-[320px] text-body-md text-on-surface-variant', action && 'mb-8')}>
        {description}
      </p>
      {action}
    </div>
  )
}
