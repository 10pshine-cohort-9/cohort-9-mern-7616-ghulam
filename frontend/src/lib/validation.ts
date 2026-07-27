const MAX_NAME_LENGTH = 60
const MIN_PASSWORD_LENGTH = 8

/*
 * Each validator returns the message to show, or null when the value is fine.
 * The message is the return value rather than a boolean so the same string is
 * used by the field and by any summary, and there is no second place where
 * wording can drift.
 *
 * These run client-side for feedback only. The backend validates independently —
 * a rule enforced solely in the browser is not enforced.
 */

export function validateName(value: string): string | null {
  const name = value.trim()
  if (!name) return 'Enter your name.'
  if (name.length > MAX_NAME_LENGTH) return `Keep your name under ${MAX_NAME_LENGTH} characters.`
  return null
}

export function validateEmail(value: string): string | null {
  const email = value.trim()
  if (!email) return 'Enter your email address.'
  // Deliberately permissive: one @, something either side, a dot in the domain.
  // Stricter patterns reject valid addresses, and only delivery proves an
  // address exists.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
  return null
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Enter a password.'
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return null
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  if (!confirmation) return 'Re-enter your password.'
  if (password !== confirmation) return 'Both passwords must match.'
  return null
}
