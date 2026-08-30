import { ApiError } from '../../types'
import { request } from '../client'

const OFFLINE_MESSAGE = 'Cannot reach the server. Check your connection and try again.'
const FALLBACK_MESSAGE = 'Something went wrong.'

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function nonJsonResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      throw new SyntaxError('Unexpected token < in JSON')
    },
  } as unknown as Response
}

const fetchMock = jest.fn()

beforeEach(() => {
  fetchMock.mockReset()
  globalThis.fetch = fetchMock as unknown as typeof fetch
})

describe('request', () => {
  it('prefixes the path with /api', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }))

    await request('/notes')

    expect(fetchMock.mock.calls[0][0]).toBe('/api/notes')
  })

  it('sends credentials include on every request', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }))

    await request('/notes')

    expect(fetchMock.mock.calls[0][1].credentials).toBe('include')
  })

  it('defaults to GET with no body and no content type', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }))

    await request('/notes')

    const init = fetchMock.mock.calls[0][1]
    expect(init.method).toBe('GET')
    expect(init.body).toBeUndefined()
    expect(init.headers).toBeUndefined()
  })

  it('serialises a body and sets the content type when one is given', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }))

    await request('/notes', { method: 'POST', body: { title: 'A note' } })

    const init = fetchMock.mock.calls[0][1]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ title: 'A note' }))
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('returns the envelope data on success', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: { id: '1' } }))

    await expect(request('/notes/1')).resolves.toEqual({ id: '1' })
  })

  it('throws ApiError with status 0 when fetch never reaches the server', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    const error = await request('/notes').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(0)
    expect((error as ApiError).message).toBe(OFFLINE_MESSAGE)
  })

  it('keeps the real status when the body is not JSON', async () => {
    fetchMock.mockResolvedValue(nonJsonResponse(502))

    const error = await request('/notes').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(502)
    expect((error as ApiError).message).toBe(FALLBACK_MESSAGE)
  })

  it('throws with the server message when the envelope reports failure', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: false, message: 'Note not found.' }, 404),
    )

    const error = await request('/notes/1').catch((caught: unknown) => caught)

    expect((error as ApiError).status).toBe(404)
    expect((error as ApiError).message).toBe('Note not found.')
  })

  it('throws when the status is ok but the envelope reports failure', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: false, message: 'Rejected.' }, 200))

    await expect(request('/notes')).rejects.toBeInstanceOf(ApiError)
  })

  it('falls back to a generic message when the failure has none', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: false }, 500))

    const error = await request('/notes').catch((caught: unknown) => caught)

    expect((error as ApiError).message).toBe(FALLBACK_MESSAGE)
  })
})
