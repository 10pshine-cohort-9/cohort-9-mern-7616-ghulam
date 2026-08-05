import { createId } from '../../lib/id'
import type { User } from '../../types'
import { ApiError, type AuthService } from '../types'
import {
  clearSession,
  clone,
  createSalt,
  delay,
  hashPassword,
  readSessionUserId,
  readUsers,
  type StoredUser,
  writeSessionUserId,
  writeUsers,
} from './storage'

/**
 * Salt used to hash a password when no account matches the email, so an unknown
 * address and a wrong password cost the same work. Without it the two paths are
 * distinguishable by response time, which leaks whether an account exists.
 */
const ABSENT_USER_SALT = 'absent-user'

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Drops the credential fields. Nothing outside this module sees them. */
function toPublicUser(stored: StoredUser): User {
  return clone({
    id: stored.id,
    name: stored.name,
    email: stored.email,
    createdAt: stored.createdAt,
  })
}

export class LocalAuthService implements AuthService {
  async register(name: string, email: string, password: string): Promise<User> {
    await delay()

    const users = readUsers()
    const normalised = normaliseEmail(email)

    if (users.some((user) => user.email === normalised)) {
      throw new ApiError('An account with that email already exists.', 409)
    }

    const salt = createSalt()
    const stored: StoredUser = {
      id: createId(),
      name: name.trim(),
      email: normalised,
      createdAt: new Date().toISOString(),
      passwordSalt: salt,
      passwordHash: await hashPassword(password, salt),
    }

    writeUsers([...users, stored])
    // Registering signs you in; the sign-up screen navigates straight to the
    // dashboard rather than bouncing through sign-in.
    writeSessionUserId(stored.id)

    return toPublicUser(stored)
  }

  async login(email: string, password: string): Promise<User> {
    await delay()

    const stored = readUsers().find((user) => user.email === normaliseEmail(email))
    const hash = await hashPassword(password, stored?.passwordSalt ?? ABSENT_USER_SALT)

    // One message and one status for both failures. Saying "no such account"
    // would confirm which addresses are registered.
    if (!stored || hash !== stored.passwordHash) {
      throw new ApiError('Incorrect email or password.', 401)
    }

    writeSessionUserId(stored.id)
    return toPublicUser(stored)
  }

  async logout(): Promise<void> {
    await delay()
    clearSession()
  }

  async getCurrentUser(): Promise<User | null> {
    await delay()

    const userId = readSessionUserId()
    if (userId === null) return null

    const stored = readUsers().find((user) => user.id === userId)
    if (!stored) {
      // Session outlived its account — clear it rather than reporting a user
      // that no longer exists.
      clearSession()
      return null
    }

    return toPublicUser(stored)
  }
}
