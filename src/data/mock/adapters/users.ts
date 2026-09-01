import { mockInvites, mockSeedUsers } from '../mock-data'
import { withLatency, clone, nextId } from '../helpers'
import type { UsersGateway } from '../../gateways'
import type { Invite, Role, User } from '@/lib/types'

let users: User[] = clone(mockSeedUsers)
let invites: Invite[] = clone(mockInvites)

export const mockUsersGateway: UsersGateway = {
  async list() {
    return withLatency(clone(users))
  },
  async invites() {
    return withLatency(clone(invites))
  },
  async createInvite(email) {
    const invite: Invite = { id: nextId(invites), email, createdAt: new Date().toISOString() }
    invites = [...invites, invite]
    return withLatency(clone(invite))
  },
  async deleteInvite(id) {
    invites = invites.filter(i => i.id !== id)
    return withLatency(undefined as unknown as void)
  },
  async checkInvite(email) {
    const invited = invites.some(i => i.email.toLowerCase() === email.trim().toLowerCase())
    return withLatency({ invited })
  },
  async updateRole(id, role: Role) {
    users = users.map(u => u.id === id ? { ...u, role } : u)
    const user = users.find(u => u.id === id)
    return withLatency(clone(user!))
  },
  async updatePassword(id, password) {
    users = users.map(u => u.id === id ? { ...u, password } : u)
    return withLatency(undefined as unknown as void)
  },
  async deleteUser(id) {
    users = users.filter(u => u.id !== id)
    return withLatency(undefined as unknown as void)
  },
}

export function setMockUsersList(next: User[]) {
  users = clone(next)
}
export function getMockUsersList(): User[] {
  return clone(users)
}
export function setMockInvites(next: Invite[]) {
  invites = clone(next)
}
export function getMockInvites(): Invite[] {
  return clone(invites)
}