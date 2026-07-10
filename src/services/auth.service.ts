import { apiClient } from './api-client'

interface AuthUser {
  id: number
  username: string
  email: string
  role: string
}

interface AuthResponse {
  user: AuthUser
}

function extractUser(data: AuthResponse | AuthUser): AuthUser {
  return 'user' in data ? data.user : data
}

export const authService = {
  async login(username: string, password: string) {
    const data = await apiClient<AuthResponse | AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: username, password }),
    })
    return extractUser(data)
  },

  async logout() {
    await apiClient('/auth/logout', { method: 'POST' })
  },

  async register(email: string, password: string) {
    await apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async me() {
    const data = await apiClient<AuthResponse | AuthUser>('/auth/me')
    return extractUser(data)
  },

  async refresh() {
    const data = await apiClient<AuthResponse | AuthUser>('/auth/refresh', { method: 'POST' })
    return extractUser(data)
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await apiClient('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  async checkEmail(email: string) {
    return apiClient<{ registered: boolean }>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async resetPassword(email: string, password: string) {
    await apiClient('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
}
