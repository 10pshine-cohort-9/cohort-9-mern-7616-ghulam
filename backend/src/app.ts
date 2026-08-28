import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'
import { errorHandler, notFound } from './middleware/errors.js'
import { authRouter } from './routes/auth.routes.js'
import { healthRouter } from './routes/health.routes.js'

export function createApp(): Express {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.corsOrigin, credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(pinoHttp({ logger }))

  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
