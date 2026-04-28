import { getAuthToken } from './auth'

const BASE = (import.meta.env.VITE_API_URL ?? '').trim()
const DEFAULT_TIMEOUT_MS = 15_000

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(status: number, message: string, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function joinUrl(base: string, path: string) {
  const cleanBase = base.replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${cleanBase}${cleanPath}`
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  if (response.status === 204) return null

  if (isJson) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  try {
    const text = await response.text()
    return text === '' ? null : text
  } catch {
    return null
  }
}

function getMessageFromPayload(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback

  const maybeError = (payload as Record<string, unknown>).error
  if (typeof maybeError === 'string' && maybeError.trim() !== '') return maybeError

  const maybeMessage = (payload as Record<string, unknown>).message
  if (typeof maybeMessage === 'string' && maybeMessage.trim() !== '') return maybeMessage

  return fallback
}

export async function request<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const url = BASE ? joinUrl(BASE, path) : path

  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const controller = new AbortController()

  if (init.signal) {
    if (init.signal.aborted) {
      controller.abort((init.signal as any).reason)
    } else {
      init.signal.addEventListener(
        'abort',
        () => controller.abort((init.signal as any).reason),
        { once: true }
      )
    }
  }

  const timeoutId = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs)

  const headers = new Headers(init.headers)

  const token = getAuthToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!headers.has('Content-Type') && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    })

    const payload = await parseBody(response)

    if (!response.ok) {
      const fallback = response.statusText || `HTTP ${response.status}`
      throw new ApiError(response.status, getMessageFromPayload(payload, fallback), payload)
    }

    return payload as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(0, 'Tempo limite excedido. Tente novamente.')
    }

    if (error instanceof Error && error.message === 'timeout') {
      throw new ApiError(0, 'Tempo limite excedido. Tente novamente.')
    }

    throw new ApiError(0, 'Falha de rede. Verifique sua conexão e tente novamente.')
  } finally {
    clearTimeout(timeoutId)
  }
}
