import { randomBytes } from 'node:crypto'
import bcrypt from 'bcrypt'
import { AppError } from '../lib/AppError.js'
import { User, type UserDocument } from '../models/User.js'

const BCRYPT_COST = 12
const DUPLICATE_KEY = 11000
const ABSENT_USER_HASH = bcrypt.hashSync(randomBytes(32).toString('hex'), BCRYPT_COST)

export interface PublicUser {
  id: string
  name: string
  email: string
  createdAt: string
}

function isDuplicateKeyError(cause: unknown): boolean {
  return (
    typeof cause === 'object' &&
    cause !== null &&
    'code' in cause &&
    (cause as { code: unknown }).code === DUPLICATE_KEY
  )
}

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function register(name: string, email: string, password: string): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST)

  try {
    const user = await User.create({ name, email, passwordHash })
    return toPublicUser(user)
  } catch (cause) {
    if (isDuplicateKeyError(cause)) {
      throw new AppError('An account with that email already exists.', 409)
    }
    throw cause
  }
}

export async function login(email: string, password: string): Promise<PublicUser> {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
  const matches = await bcrypt.compare(password, user?.passwordHash ?? ABSENT_USER_HASH)

  if (user === null || !matches) {
    throw new AppError('Incorrect email or password.', 401)
  }
  return toPublicUser(user)
}

export async function getUserById(id: string): Promise<PublicUser> {
  const user = await User.findById(id)
  if (user === null) {
    throw new AppError('You are not signed in.', 401)
  }
  return toPublicUser(user)
}
