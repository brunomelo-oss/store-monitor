import { App } from '@/types'
import { apiClient } from './api-client'

export const appsService = {
  async list(): Promise<App[]> {
    return apiClient<App[]>('/apps')
  },

  async getById(id: number): Promise<App> {
    return apiClient<App>(`/apps/${id}`)
  },

  async create(data: Partial<App>): Promise<App> {
    return apiClient<App>('/apps', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: number, data: Partial<App>): Promise<App> {
    return apiClient<App>(`/apps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient(`/apps/${id}`, { method: 'DELETE' })
  },

  async togglePin(id: number): Promise<App> {
    return apiClient<App>(`/apps/${id}/pin`, { method: 'PATCH' })
  },

  async move(id: number, direction: 1 | -1): Promise<App[]> {
    return apiClient<App[]>(`/apps/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ direction }),
    })
  },

  async bulkReplace(apps: Partial<App>[]): Promise<App[]> {
    return apiClient<App[]>('/apps/bulk', {
      method: 'PUT',
      body: JSON.stringify({ apps }),
    })
  },
}
