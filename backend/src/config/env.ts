import 'dotenv/config'

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

const nodeEnv = optional('NODE_ENV', 'development')

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: toPort(optional('PORT', '5000')),
  mongoUri: required('MONGODB_URI'),
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:5173'),
  logLevel: optional('LOG_LEVEL', 'info'),
}
