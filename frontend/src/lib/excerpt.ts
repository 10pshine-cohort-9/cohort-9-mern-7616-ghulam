const DEFAULT_MAX_LENGTH = 160

/**
 * Elements whose boundary a reader hears as a break. Without a separator at each
 * one, `textContent` returns `<p>one</p><p>two</p>` as "onetwo" — every
 * multi-paragraph note card would run words together.
 */
const BLOCK_ELEMENTS = 'p, div, br, li, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, pre, tr'

/**
 * Turns TipTap HTML into plain text.
 *
 * Parses rather than stripping tags with a regex: a regex mangles any `>` inside
 * an attribute value, and `textContent` alone would keep the contents of
 * `<script>` and `<style>` as visible text.
 */
export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Removed rather than skipped: these hold code, not prose, and their text
  // would otherwise land in an excerpt and in search results.
  doc.body.querySelectorAll('script, style').forEach((element) => element.remove())

  for (const element of doc.body.querySelectorAll(BLOCK_ELEMENTS)) {
    element.after(doc.createTextNode(' '))
  }

  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * Plain-text preview for a note card. Truncates on a word boundary so the
 * result never ends mid-word.
 */
export function excerpt(html: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  const text = stripHtml(html)
  if (text.length <= maxLength) return text

  const clipped = text.slice(0, maxLength)
  const lastSpace = clipped.lastIndexOf(' ')
  // A single word longer than the limit has no boundary to fall back to.
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`
}
