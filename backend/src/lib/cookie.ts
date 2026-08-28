import type { CookieOptions } from 'express'
import { env } from '../config/env.js'

export const AUTH_COOKIE = 'aether_token'

export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
  path: '/',
}

export const cookieOptions: CookieOptions = {
  ...clearCookieOptions,
  maxAge: env.jwtExpiresInMs,
}
