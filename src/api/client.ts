import type { ApiErrorBody } from './types'

/**
 * Small typed fetch wrapper. Build your query functions on top of this.
 *
 * MSW intercepts these requests in the browser and in tests, so the same
 * `/api/...` paths work locally and in the deployed demo.
 */
const BASE_URL = import.meta.env.BASE_URL

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>
  readonly meta?: Record<string, unknown>

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.error.message ?? `Request failed (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.error.code ?? 'UNKNOWN'
    this.fields = body?.error.fields
    this.meta = body?.error.meta
  }
}

export class InvalidResponseError extends Error {
  constructor() {
    super('The API returned an invalid JSON response')
    this.name = 'InvalidResponseError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function errorBody(body: unknown): ApiErrorBody | null {
  if (!isRecord(body) || !isRecord(body.error)) return null
  const { code, message, fields, meta } = body.error
  if (typeof code !== 'string' || typeof message !== 'string') return null
  return { error: {
    code,
    message,
    ...(isRecord(fields) && Object.values(fields).every((value) => typeof value === 'string')
      ? { fields: fields as Record<string, string> } : {}),
    ...(isRecord(meta) ? { meta } : {}),
  } }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path.replace(/^\//, '')}`
  const response = await fetch(url, init)
  let body: unknown
  try {
    body = await response.json()
  } catch (error) {
    // Cancellation and transport errors remain distinguishable from invalid JSON.
    if (!(error instanceof SyntaxError)) throw error
    if (response.ok) throw new InvalidResponseError()
    body = null
  }

  if (!response.ok) {
    throw new ApiError(response.status, errorBody(body))
  }
  if (body === null) throw new InvalidResponseError()
  return body as T
}
