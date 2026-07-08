import { apiClient } from './api-client'

export interface StoreConnection {
  id: number
  store: 'GOOGLE' | 'APPLE'
  label: string
  isActive: boolean
  lastSyncAt: string | null
}

export const storeConnectionsService = {
  async list() {
    return apiClient<StoreConnection[]>('/v1/store-connections')
  },

  async getById(id: number) {
    return apiClient<StoreConnection>(`/v1/store-connections/${id}`)
  },

  async create(data: { store: string; label: string; credentials: Record<string, unknown> }) {
    return apiClient<StoreConnection>('/v1/store-connections', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: number, data: { label?: string; credentials?: Record<string, unknown> }) {
    return apiClient<StoreConnection>(`/v1/store-connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async test(id: number) {
    return apiClient<{ valid: boolean; message?: string }>(`/v1/store-connections/${id}/test`, { method: 'POST' })
  },

  async delete(id: number) {
    return apiClient<{ ok: boolean }>(`/v1/store-connections/${id}`, { method: 'DELETE' })
  },
}
