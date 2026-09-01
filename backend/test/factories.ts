import request from 'supertest'
import { createApp } from '../src/app.js'
import { AppError } from '../src/lib/AppError.js'
import { register } from '../src/services/auth.service.js'
import { createNote } from '../src/services/notes.service.js'
import type { PublicNote } from '../src/services/notes.service.js'
import type { PublicUser } from '../src/services/auth.service.js'

export const app = createApp()

const DEFAULT_PASSWORD = 'password123'

let counter = 0

export function uniqueEmail(): string {
  counter += 1
  return `user${counter}@example.com`
}

export interface TestUser extends PublicUser {
  password: string
}

export async function makeUser(
  overrides: { name?: string; email?: string; password?: string } = {},
): Promise<TestUser> {
  const password = overrides.password ?? DEFAULT_PASSWORD
  const user = await register(
    overrides.name ?? 'Test User',
    overrides.email ?? uniqueEmail(),
    password,
  )
  return { ...user, password }
}

export function makeNote(
  userId: string,
  overrides: { title?: string; content?: string } = {},
): Promise<PublicNote> {
  return createNote(userId, {
    title: overrides.title ?? 'A note',
    content: overrides.content ?? '<p>Body text</p>',
  })
}

export async function rejects(promise: Promise<unknown>): Promise<AppError> {
  try {
    await promise
  } catch (error) {
    return error as AppError
  }
  throw new Error('Expected the promise to reject, but it resolved.')
}

export interface SignedInAgent {
  agent: ReturnType<typeof request.agent>
  email: string
  password: string
}

export async function signedInAgent(): Promise<SignedInAgent> {
  const agent = request.agent(app)
  const email = uniqueEmail()

  await agent
    .post('/api/auth/register')
    .send({ name: 'Test User', email, password: DEFAULT_PASSWORD })
    .expect(201)

  return { agent, email, password: DEFAULT_PASSWORD }
}
