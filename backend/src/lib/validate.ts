import { AppError } from './AppError.js'

interface StringRules {
  label: string
  max: number
}

function read(body: unknown, field: string): unknown {
  if (typeof body !== 'object' || body === null) return undefined
  return (body as Record<string, unknown>)[field]
}

export function requireString(body: unknown, field: string, rules: StringRules): string {
  const value = read(body, field)

  if (typeof value !== 'string') {
    throw new AppError(`${rules.label} is required.`, 400)
  }
  if (value.length > rules.max) {
    throw new AppError(`${rules.label} must be ${rules.max} characters or fewer.`, 400)
  }
  return value
}

export function optionalString(
  body: unknown,
  field: string,
  rules: StringRules,
): string | undefined {
  return read(body, field) === undefined ? undefined : requireString(body, field, rules)
}
