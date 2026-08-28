import type { RequestHandler } from 'express'
import { AppError } from '../lib/AppError.js'
import { AUTH_COOKIE } from '../lib/cookie.js'
import { verifyToken } from '../lib/jwt.js'

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token: unknown = req.cookies[AUTH_COOKIE]

  if (typeof token !== 'string' || token.trim() === '') {
    throw new AppError('You are not signed in.', 401)
  }

  req.userId = verifyToken(token)
  next()
}
