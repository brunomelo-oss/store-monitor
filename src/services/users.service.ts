import { Invite } from '@/types'
import { apiClient } from './api-client'

interface UserResponse {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
}

export const usersService = {
  async list(): Promise<UserResponse[]> {
    return apiClient<UserResponse[]>('/users')
  },

  async create(email: string, password: string, role: string): Promise<UserResponse> {
    return apiClient<UserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    })
  },

  async updateRole(id: number, role: string): Promise<UserResponse> {
    return apiClient<UserResponse>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  },

  async updatePassword(id: number, password: string): Promise<void> {
    await apiClient(`/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient(`/users/${id}`, { method: 'DELETE' })
  },

  async getInvites(): Promise<Invite[]> {
    return apiClient<Invite[]>('/invites')
  },

  async createInvite(email: string): Promise<Invite> {
    return apiClient<Invite>('/invites', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async deleteInvite(id: number): Promise<void> {
    await apiClient(`/invites/${id}`, { method: 'DELETE' })
  },

  async checkInvite(email: string) {
    return apiClient<{ invited: boolean }>(`/invites/check/${encodeURIComponent(email)}`)
  },
}
