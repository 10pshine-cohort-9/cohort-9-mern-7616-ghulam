import type { ErrorRequestHandler, RequestHandler } from 'express'
import { AppError } from '../lib/AppError.js'
import { logger } from '../lib/logger.js'

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404))
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    logger.warn({ status: error.status, message: error.message }, 'Request rejected')
    res.status(error.status).json({ success: false, message: error.message })
    return
  }

  logger.error({ err: error }, 'Unhandled error')
  res.status(500).json({ success: false, message: 'Something went wrong.' })
}
