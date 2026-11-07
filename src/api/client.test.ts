import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiFetch, InvalidResponseError } from './client'

afterEach(() => vi.unstubAllGlobals())

describe('API response boundary', () => {
  it.each(['<html>Vite</html>', '{broken', 'null'])('rejects invalid successful body %s without replaying POST', async (body) => {
    const fetch = vi.fn().mockResolvedValue(new Response(body))
    vi.stubGlobal('fetch', fetch)
    await expect(apiFetch('/api/transfers', { method: 'POST' })).rejects.toBeInstanceOf(InvalidResponseError)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('returns successful JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ accounts: [] })))
    await expect(apiFetch('/api/accounts')).resolves.toEqual({ accounts: [] })
  })

  it('preserves API error details', async () => {
    const error = { code: 'VALIDATION_ERROR', message: 'Invalid amount', fields: { amount: 'Too high' }, meta: { available: 12 } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error }, { status: 422 })))
    await expect(apiFetch('/api/transfers', { method: 'POST' })).rejects.toMatchObject({ name: 'ApiError', status: 422, ...error })
  })

  it.each(['<html>error</html>', 'null', '{"error":null}', '{"error":{"message":4}}'])('handles malformed HTTP error body %s', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 500 })))
    await expect(apiFetch('/api/accounts')).rejects.toMatchObject({ name: 'ApiError', status: 500, code: 'UNKNOWN' })
  })

  it('preserves abort during fetch and body reading', async () => {
    const abort = new DOMException('Cancelled', 'AbortError')
    const fetch = vi.fn().mockRejectedValueOnce(abort).mockResolvedValueOnce({ ok: true, json: () => Promise.reject(abort) })
    vi.stubGlobal('fetch', fetch)
    await expect(apiFetch('/api/accounts')).rejects.toBe(abort)
    await expect(apiFetch('/api/accounts')).rejects.toBe(abort)
    expect(abort).not.toBeInstanceOf(ApiError)
  })
})
