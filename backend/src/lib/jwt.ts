import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from './AppError.js'

export function signToken(userId: string): string {
  return jwt.sign({}, env.jwtSecret, {
    subject: userId,
    expiresIn: Math.floor(env.jwtExpiresInMs / 1000),
  })
}

export function verifyToken(token: string): string {
  let payload: string | jwt.JwtPayload
  try {
    payload = jwt.verify(token, env.jwtSecret)
  } catch {
    throw new AppError('Your session has expired.', 401)
  }

  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new AppError('Your session has expired.', 401)
  }
  return payload.sub
}
