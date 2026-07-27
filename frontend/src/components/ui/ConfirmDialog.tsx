import { useEffect, useId, useRef, type MouseEvent, type SyntheticEvent } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Built on the native `<dialog>` deliberately: `showModal()` supplies the focus
 * trap, the inert background and Escape-to-close that would otherwise be a
 * few hundred lines of hand-rolled and subtly wrong keyboard handling.
 *
 * The `open` attribute is never set as a prop — that renders a non-modal dialog
 * with none of those guarantees.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  // Escape fires `cancel`. Suppressing the default keeps the element's open
  // state owned by the `open` prop instead of drifting from it.
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault()
    onCancel()
  }

  // A click that lands on the dialog element itself came from the backdrop;
  // anything inside the panel stops at the panel.
  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === ref.current) onCancel()
  }

  return (
    <dialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="glass-panel ambient-shadow open:dialog-in m-auto max-w-[420px] rounded-xxl p-stack-md text-on-surface backdrop:bg-primary/20 backdrop:backdrop-blur-[20px]"
      onCancel={handleCancel}
      onClick={handleClick}
      ref={ref}
    >
      <h2 className="mb-2 text-headline-md text-primary" id={titleId}>
        {title}
      </h2>
      <p className="mb-stack-md text-body-md text-on-surface-variant" id={descriptionId}>
        {description}
      </p>
      <div className="flex justify-end gap-3">
        {/* Cancel takes initial focus: on a destructive prompt the safe path
            should be the one a stray Enter lands on. */}
        <Button autoFocus onClick={onCancel} variant="ghost">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="danger">
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
