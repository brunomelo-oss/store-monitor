import { apiClient } from '@/data/api-client'
import type { UsersGateway } from '../../gateways'
import type { Role, User, Invite } from '@/lib/types'

export const apiUsersGateway: UsersGateway = {
  list() {
    return apiClient<User[]>('/users')
  },
  invites() {
    return apiClient<Invite[]>('/invites')
  },
  createInvite(email) {
    return apiClient<Invite>('/invites', { method: 'POST', body: JSON.stringify({ email }) })
  },
  deleteInvite(id) {
    return apiClient<void>(`/invites/${id}`, { method: 'DELETE' })
  },
  updateRole(id, role: Role) {
    return apiClient<User>(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })
  },
  updatePassword(id, password) {
    return apiClient<void>(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) })
  },
  deleteUser(id) {
    return apiClient<void>(`/users/${id}`, { method: 'DELETE' })
  },
}