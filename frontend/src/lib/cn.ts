import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/*
 * tailwind-merge has to be told about the `--text-*` scale from index.css.
 * Out of the box it recognises `text-lg` as a size and anything else after
 * `text-` as a colour, so `cn('text-label-sm', 'text-on-primary-container')`
 * silently dropped the size and every button rendered at the inherited 16px
 * instead of 13px. Registering the names restores both conflict groups: a size
 * still overrides a size, a colour still overrides a colour, and the two no
 * longer collide.
 *
 * Any font-size token added to `@theme` has to be added here too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'headline-xl',
        'headline-lg',
        'headline-md',
        'body-lg',
        'body-md',
        'label-sm',
        'label-caps',
      ],
    },
  },
})

/**
 * Merges class names, letting later Tailwind utilities win over earlier ones.
 * Without twMerge a caller passing `p-2` to a component that already sets `p-4`
 * gets both classes and whichever CSS rule happens to come last in the sheet.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
