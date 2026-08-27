import type { User } from '../../types'
import { ApiError, type AuthService } from '../types'
import { request } from './client'

export class HttpAuthService implements AuthService {
  register(name: string, email: string, password: string): Promise<User> {
    return request<User>('/auth/register', { method: 'POST', body: { name, email, password } })
  }

  login(email: string, password: string): Promise<User> {
    return request<User>('/auth/login', { method: 'POST', body: { email, password } })
  }

  async logout(): Promise<void> {
    await request<undefined>('/auth/logout', { method: 'POST' })
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await request<User>('/auth/me')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }
  }
}
