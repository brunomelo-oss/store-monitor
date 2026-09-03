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
  setupAccount(email, password, token) {
    return apiClient<void>('/auth/setup', { method: 'POST', body: JSON.stringify({ email, password, token }) })
  },
  checkEmail(email) {
    return apiClient<{ registered: boolean }>('/auth/check-email', { method: 'POST', body: JSON.stringify({ email }) })
  },
  forgotPassword(email) {
    return apiClient<void>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
  },
  resetPassword(token, password) {
    return apiClient<void>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) })
  },
  changePassword(currentPassword, newPassword) {
    return apiClient<void>('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) })
  },
}