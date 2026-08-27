import { ApiError } from '../types'

interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data?: T
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

const BASE_URL = '/api'
const OFFLINE_MESSAGE = 'Cannot reach the server. Check your connection and try again.'
const FALLBACK_MESSAGE = 'Something went wrong.'

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await response.json()) as ApiEnvelope<T>
  } catch {
    return { success: false }
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options
  let response: Response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(OFFLINE_MESSAGE, 0)
  }

  const envelope = await readEnvelope<T>(response)

  if (!response.ok || !envelope.success) {
    throw new ApiError(envelope.message ?? FALLBACK_MESSAGE, response.status)
  }

  return envelope.data as T
}
