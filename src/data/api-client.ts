const BASE = '/api'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getErrorMessage(e: unknown): string {
  if (typeof e === 'string') return e
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object') {
    const obj = e as Record<string, unknown>
    const err = obj.error as Record<string, unknown> | undefined
    if (err && typeof err.message === 'string') return err.message
    if (typeof obj.message === 'string') return obj.message
    const data = obj.data as Record<string, unknown> | undefined
    if (data && typeof data.message === 'string') return data.message
  }
  return 'Erro inesperado'
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      credentials: 'include',
      signal: controller.signal,
    })

    if (res.status === 204) return undefined as T
    if (!res.ok) {
      let message = 'Erro inesperado'
      try {
        const body = await res.json()
        message = getErrorMessage(body) ?? `HTTP ${res.status}`
      } catch {
        message = `HTTP ${res.status}`
      }
      throw new ApiError(message, res.status)
    }

    const body = (await res.json()) as { success?: boolean; data?: T } | T
    if (body && typeof body === 'object' && 'success' in body && (body as { success: boolean }).success === true) {
      return (body as { data: T }).data
    }
    return body as T
  } finally {
    clearTimeout(timeout)
  }
}