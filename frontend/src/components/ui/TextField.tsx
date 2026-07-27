import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string | null
}

export function TextField({ label, error, className, ...props }: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-2">
      <label className="ml-1 text-label-sm font-semibold text-on-surface" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded-xl border bg-surface-container-lowest px-4 py-3',
          'text-body-md text-on-surface',
          // The mockup places `outline-variant` here, which measures 1.71:1 on
          // the field background. `muted-green` is the palette's other quiet
          // tone and clears AA in both themes (4.63:1 / 11.38:1).
          'placeholder:text-muted-green',
          'transition-colors duration-200 ease-out',
          // Focus changes border colour and adds a ring, so the indicator is a
          // thickness change rather than colour alone.
          'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
          error ? 'border-error' : 'border-glass-stroke',
          className,
        )}
        {...props}
      />
      {error && (
        <p className="ml-1 text-label-sm text-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
