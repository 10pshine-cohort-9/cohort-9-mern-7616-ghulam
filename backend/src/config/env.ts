import 'dotenv/config'

const DURATION_SCALE = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }

function fail(message: string): never {
  process.stderr.write(`[config] ${message}\n`)
  process.exit(1)
}

function optional(name: string, fallback: string): string {
  const value = process.env[name]
  return value === undefined || value.trim() === '' ? fallback : value.trim()
}

function required(name: string): string {
  const value = process.env[name]
  if (value === undefined || value.trim() === '') {
    fail(`Missing required environment variable ${name}. Copy backend/.env.example to backend/.env.`)
  }
  return value.trim()
}

function toPort(value: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    fail(`PORT must be an integer between 1 and 65535, received "${value}".`)
  }
  return parsed
}

function toDurationMs(name: string, value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value)
  if (match === null) {
    return fail(`${name} must look like 30m, 24h or 7d, received "${value}".`)
  }
  const milliseconds = Number(match[1]) * DURATION_SCALE[match[2] as keyof typeof DURATION_SCALE]
  if (milliseconds <= 0) {
    return fail(`${name} must be greater than zero, received "${value}".`)
  }
  return milliseconds
}

const nodeEnv = optional('NODE_ENV', 'development')

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: toPort(optional('PORT', '5000')),
  mongoUri: required('MONGODB_URI'),
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:5173'),
  logLevel: optional('LOG_LEVEL', 'info'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresInMs: toDurationMs('JWT_EXPIRES_IN', optional('JWT_EXPIRES_IN', '7d')),
}
