const BASE = '/api'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (!error || typeof error !== 'object') return 'Erro inesperado'

  if (error instanceof Error) return error.message

  const obj = error as Record<string, unknown>

  // Axios-like: response.data.message / response.data.error
  if (obj.response && typeof obj.response === 'object') {
    const data = (obj.response as Record<string, unknown>).data
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>
      if (typeof d.message === 'string') return d.message
      if (typeof d.error === 'string') return d.error
    }
  }

  // API envelope: { error: { message } } or { error: string }
  if ('error' in obj) {
    if (typeof obj.error === 'string') return obj.error
    if (obj.error && typeof obj.error === 'object') {
      const e = obj.error as Record<string, unknown>
      if (typeof e.message === 'string') return e.message
    }
  }

  // { message: string }
  if (typeof obj.message === 'string') return obj.message

  // Validation array: { errors: [{ message }] }
  if (Array.isArray(obj.errors) && obj.errors.length > 0) {
    const first = obj.errors[0]
    if (first && typeof first === 'object' && typeof (first as Record<string, unknown>).message === 'string') {
      return (first as Record<string, unknown>).message as string
    }
  }

  // Zod: { issues: [{ message }] }
  if (Array.isArray(obj.issues) && obj.issues.length > 0) {
    const first = obj.issues[0]
    if (first && typeof first === 'object' && typeof (first as Record<string, unknown>).message === 'string') {
      return (first as Record<string, unknown>).message as string
    }
  }

  // { data: { message } } or { data: { error } }
  if (obj.data && typeof obj.data === 'object') {
    const d = obj.data as Record<string, unknown>
    if (typeof d.message === 'string') return d.message
    if (typeof d.error === 'string') return d.error
  }

  return 'Erro inesperado'
}

/** @deprecated Use getErrorMessage() instead */
export const extractError = getErrorMessage

export const API_TIMEOUT = 5000

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT)

  const res = await fetch(`${BASE}${path}`, {
    signal: controller.signal,
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  clearTimeout(timer)

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Erro de conexão' }))
    throw new ApiError(getErrorMessage(body) || `Erro ${res.status}`, res.status)
  }

  if (res.status === 204) return undefined as T

  const body = await res.json()

  if (body && typeof body === 'object' && 'success' in body) {
    if (body.success === true && 'data' in body) {
      return body.data as T
    }
    throw new ApiError(body.error?.message || 'Erro inesperado', res.status)
  }

  return body as T
}
