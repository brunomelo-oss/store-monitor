import { App, User, Invite } from '@/types'

const BASE = '/api'

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Erro de conexão' }))
    throw new Error(body.error || `Erro ${res.status}`)
  }
  return res.json()
}

export const backendApi = {
  // Auth
  async login(username: string, password: string) {
    const data = await api<{ user: { username: string; email: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    return data.user
  },

  async logout() {
    await api('/auth/logout', { method: 'POST' })
  },

  async register(email: string, password: string) {
    await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async me() {
    return api<{ user: { username: string; email: string; role: string } }>('/auth/me')
  },

  async refresh() {
    return api<{ user: { username: string; email: string; role: string } }>('/auth/refresh', { method: 'POST' })
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await api('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  async checkEmail(email: string): Promise<void> {
    await api('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async resetPassword(email: string, password: string) {
    await api('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  // Apps
  async getApps(): Promise<App[]> {
    return api<App[]>('/apps')
  },

  async createApp(app: Partial<App>): Promise<App> {
    return api<App>('/apps', { method: 'POST', body: JSON.stringify(app) })
  },

  async updateApp(id: number, data: Partial<App>): Promise<App> {
    return api<App>(`/apps/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  async deleteApp(id: number): Promise<void> {
    await api(`/apps/${id}`, { method: 'DELETE' })
  },

  async togglePin(id: number): Promise<App> {
    return api<App>(`/apps/${id}/pin`, { method: 'PATCH' })
  },

  async moveApp(id: number, direction: 1 | -1): Promise<App[]> {
    return api<App[]>(`/apps/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ direction }),
    })
  },

  async bulkReplace(apps: any[]): Promise<App[]> {
    return api<App[]>('/apps/bulk', {
      method: 'PUT',
      body: JSON.stringify({ apps }),
    })
  },

  // Users (admin)
  async getUsers(): Promise<any[]> {
    return api<any[]>('/users')
  },

  async createUser(email: string, password: string, role: string): Promise<any> {
    return api<any>('/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    })
  },

  async updateUserPassword(id: number, password: string): Promise<void> {
    await api(`/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    })
  },

  async updateUserRole(id: number, role: string): Promise<any> {
    return api<any>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  },

  async deleteUser(id: number): Promise<void> {
    await api(`/users/${id}`, { method: 'DELETE' })
  },

  // Invites (admin)
  async getInvites(): Promise<Invite[]> {
    return api<Invite[]>('/invites')
  },

  async createInvite(email: string): Promise<Invite> {
    return api<Invite>('/invites', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async deleteInvite(id: number): Promise<void> {
    await api(`/invites/${id}`, { method: 'DELETE' })
  },

  async checkInvite(email: string): Promise<{ invited: boolean }> {
    return api<{ invited: boolean }>(`/invites/check/${encodeURIComponent(email)}`)
  },
}
