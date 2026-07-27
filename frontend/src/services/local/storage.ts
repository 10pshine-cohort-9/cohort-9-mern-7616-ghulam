import type { Note, User } from '../../types'

/**
 * The only module in the app that touches localStorage. Everything else goes
 * through the service interfaces, so replacing this with HTTP calls does not
 * reach into any component.
 */

const KEYS = {
  users: 'aether.users',
  notes: 'aether.notes',
  session: 'aether.session',
} as const

/**
 * Latency the real API will have anyway. Without it the skeletons and loading
 * states are unreachable — they would flash for a frame or never render — and
 * they are part of what this phase has to deliver.
 */
export const LATENCY_MS = 150

export interface StoredUser extends User {
  passwordHash: string
  passwordSalt: string
}

export function delay(ms: number = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Returns a detached copy so a caller cannot mutate the store by holding onto a
 * reference. The HTTP adapter gets this for free by deserialising a response;
 * building against a shared-reference version would hide the resulting bugs
 * until the swap.
 */
export function clone<T>(value: T): T {
  return structuredClone(value)
}

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    // A half-written or hand-edited entry should not brick the app on load.
    return fallback
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function readUsers(): StoredUser[] {
  return read<StoredUser[]>(KEYS.users, [])
}

export function writeUsers(users: StoredUser[]): void {
  write(KEYS.users, users)
}

export function readNotes(): Note[] {
  return read<Note[]>(KEYS.notes, [])
}

export function writeNotes(notes: Note[]): void {
  write(KEYS.notes, notes)
}

export function readSessionUserId(): string | null {
  return read<string | null>(KEYS.session, null)
}

export function writeSessionUserId(userId: string): void {
  write(KEYS.session, userId)
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.session)
}

export function createSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)))
}

/**
 * SHA-256 over a per-user salt, so a password is never written to disk in
 * readable form and two users with the same password get different digests.
 *
 * This is a prototype placeholder, not a substitute for the real thing: a bare
 * digest has no key stretching, so it is cheap to attack offline. The backend
 * hashes with bcrypt, and once it exists no password reaches this file at all.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return toHex(new Uint8Array(digest))
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
