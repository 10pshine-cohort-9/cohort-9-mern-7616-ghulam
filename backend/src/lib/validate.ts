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

export function requireBoolean(body: unknown, field: string, label: string): boolean {
  const value = read(body, field)

  if (typeof value !== 'boolean') {
    throw new AppError(`${label} must be true or false.`, 400)
  }
  return value
}

export function requireOneOf<T extends string>(
  body: unknown,
  field: string,
  allowed: readonly T[],
  label: string,
): T {
  const value = read(body, field)

  if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) {
    throw new AppError(`${label} must be one of: ${allowed.join(', ')}.`, 400)
  }
  return value as T
}
