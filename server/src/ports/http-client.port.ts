export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  headers?: Record<string, string>
  body?: unknown
}

export interface HttpResponse<T = unknown> {
  status: number
  data: T
  headers: Record<string, string>
}

export interface HttpClient {
  request<T>(req: HttpRequest): Promise<HttpResponse<T>>
}
