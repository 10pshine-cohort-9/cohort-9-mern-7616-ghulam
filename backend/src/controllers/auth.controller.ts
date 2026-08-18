import type { RequestHandler } from 'express'
import { AppError } from '../lib/AppError.js'
import { AUTH_COOKIE, clearCookieOptions, cookieOptions } from '../lib/cookie.js'
import { signToken } from '../lib/jwt.js'
import { logger } from '../lib/logger.js'
import { getUserById, login, register } from '../services/auth.service.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME_LENGTH = 60
const MIN_PASSWORD_LENGTH = 8

function readString(body: unknown, field: string): string {
  if (typeof body !== 'object' || body === null) return ''
  const value = (body as Record<string, unknown>)[field]
  return typeof value === 'string' ? value : ''
}

function requireName(body: unknown): string {
  const name = readString(body, 'name').trim()
  if (name === '') {
    throw new AppError('Enter your name.', 400)
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new AppError(`Keep your name under ${MAX_NAME_LENGTH} characters.`, 400)
  }
  return name
}

function requireEmail(body: unknown): string {
  const email = readString(body, 'email').trim()
  if (email === '') {
    throw new AppError('Enter your email address.', 400)
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError('Enter a valid email address.', 400)
  }
  return email
}

function requirePassword(body: unknown): string {
  const password = readString(body, 'password')
  if (password === '') {
    throw new AppError('Enter a password.', 400)
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`, 400)
  }
  return password
}

export const postRegister: RequestHandler = async (req, res) => {
  const name = requireName(req.body)
  const email = requireEmail(req.body)
  const password = requirePassword(req.body)

  const user = await register(name, email, password)

  res.cookie(AUTH_COOKIE, signToken(user.id), cookieOptions)
  logger.info({ userId: user.id }, 'User registered')
  res.status(201).json({ success: true, data: user })
}

export const postLogin: RequestHandler = async (req, res) => {
  const email = readString(req.body, 'email').trim()
  const password = readString(req.body, 'password')

  if (email === '' || password === '') {
    throw new AppError('Incorrect email or password.', 401)
  }

  const user = await login(email, password)

  res.cookie(AUTH_COOKIE, signToken(user.id), cookieOptions)
  logger.info({ userId: user.id }, 'User signed in')
  res.json({ success: true, data: user })
}

export const postLogout: RequestHandler = (_req, res) => {
  res.clearCookie(AUTH_COOKIE, clearCookieOptions)
  logger.info('User signed out')
  res.json({ success: true })
}

export const getMe: RequestHandler = async (req, res) => {
  if (req.userId === undefined) {
    throw new AppError('You are not signed in.', 401)
  }

  const user = await getUserById(req.userId)
  res.json({ success: true, data: user })
}
