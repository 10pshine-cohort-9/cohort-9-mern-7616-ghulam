import { createApp } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'

async function start(): Promise<void> {
  await connectDatabase()

  const server = createApp().listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port} in ${env.nodeEnv} mode`)
  })

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down`)
    server.close(() => {
      void disconnectDatabase().then(() => process.exit(0))
    })
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

start().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Failed to start the API')
  process.exit(1)
})
