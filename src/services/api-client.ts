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

export function extractError(e: unknown): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  if (e && typeof e === 'object') {
    if ('message' in e && typeof (e as any).message === 'string') return (e as any).message
    if ('error' in e && typeof (e as any).error === 'string') return (e as any).error
  }
  return 'Erro inesperado'
}

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Erro de conexão' }))
    throw new ApiError(body.error || `Erro ${res.status}`, res.status)
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
