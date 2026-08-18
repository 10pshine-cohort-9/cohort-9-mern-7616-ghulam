const SCRIPT_OR_STYLE = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi
const COMMENT = /<!--[\s\S]*?-->/g
const BLOCK_BOUNDARY = /<(?:br\s*\/?|\/(?:p|div|li|ul|ol|h[1-6]|blockquote|pre|tr|td|th))\s*>/gi
const TAG = /<\/?[a-zA-Z][^\s/>]*(?:\s+[^\s/>"'=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*\s*\/?>/g
const ENTITY = /&(amp|lt|gt|quot|apos|#39);/g

const ENTITY_VALUES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
}

export function toPlainText(html: string): string {
  return html
    .replace(SCRIPT_OR_STYLE, ' ')
    .replace(COMMENT, ' ')
    .replace(BLOCK_BOUNDARY, ' ')
    .replace(TAG, '')
    .replace(ENTITY, (match, name: string) => ENTITY_VALUES[name] ?? match)
    .replace(/\s+/g, ' ')
    .trim()
}
