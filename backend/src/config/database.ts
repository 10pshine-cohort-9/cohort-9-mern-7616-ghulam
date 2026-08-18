import mongoose from 'mongoose'
import { logger } from '../lib/logger.js'
import { env } from './env.js'

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'))
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'))
  mongoose.connection.on('error', (error) => logger.error({ err: error }, 'MongoDB error'))

  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 })
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close()
}
