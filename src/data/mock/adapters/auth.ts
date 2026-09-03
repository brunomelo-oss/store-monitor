import { mockCurrentUser, mockSeedUsers } from '../mock-data'
import { withLatency, clone } from '../helpers'
import type { AuthGateway, AuthUserRow } from '../../gateways'
import type { AuthUser } from '@/lib/types'

let users: AuthUserRow[] = clone(mockSeedUsers as unknown as AuthUserRow[])

export const mockAuthGateway: AuthGateway = {
  async login(username: string, _password: string) {
    const normalized = username.trim().toLowerCase()
    const found = users.find(u => u.email.toLowerCase() === normalized || u.username.toLowerCase() === normalized)
    const user: AuthUserRow = found ? clone(found) : { ...mockCurrentUser } as AuthUserRow
    const { password: _pw, ...authUser } = user
    return withLatency(authUser)
  },
  async me() {
    const { password: _pw, ...authUser } = clone(mockCurrentUser as AuthUserRow)
    return withLatency(authUser)
  },
  async logout() {
    return withLatency(undefined as unknown as void)
  },
  async setupAccount(_email, _password, _token) {
    return withLatency(undefined as unknown as void)
  },
  async checkEmail() {
    return withLatency({ registered: true })
  },
  async forgotPassword(_email) {
    return withLatency(undefined as unknown as void)
  },
  async resetPassword(_token, _password) {
    return withLatency(undefined as unknown as void)
  },
  async changePassword(_currentPassword, _newPassword) {
    return withLatency(undefined as unknown as void)
  },
}

export function setMockUsers(next: AuthUserRow[]) {
  users = clone(next)
}
export function getMockUsers(): AuthUserRow[] {
  return clone(users)
}