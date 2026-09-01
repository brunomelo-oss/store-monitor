import { apiClient } from '@/data/api-client'
import type { AuthGateway } from '../../gateways'
import type { AuthUser } from '@/lib/types'

export const apiAuthGateway: AuthGateway = {
  login(username, password) {
    return apiClient<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: username, password }),
    })
  },
  me() {
    return apiClient<AuthUser>('/auth/me')
  },
  logout() {
    return apiClient<void>('/auth/logout', { method: 'POST' })
  },
  setupAccount(email, password) {
    return apiClient<void>('/auth/setup', { method: 'POST', body: JSON.stringify({ email, password }) })
  },
  checkEmail(email) {
    return apiClient<{ registered: boolean }>('/auth/check-email', { method: 'POST', body: JSON.stringify({ email }) })
  },
  resetPassword(email, password) {
    return apiClient<void>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, password }) })
  },
}