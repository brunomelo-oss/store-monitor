import { HttpClient, HttpRequest, HttpResponse } from './http-client.port'

export class FetchHttpClient implements HttpClient {
  async request<T>(req: HttpRequest): Promise<HttpResponse<T>> {
    const res = await fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body ? JSON.stringify(req.body) : undefined,
    })

    const data = res.headers.get('content-type')?.includes('application/json')
      ? await res.json()
      : await res.text()

    const headers: Record<string, string> = {}
    res.headers.forEach((value, key) => { headers[key] = value })

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${data}`)

    return { status: res.status, data: data as T, headers }
  }
}
