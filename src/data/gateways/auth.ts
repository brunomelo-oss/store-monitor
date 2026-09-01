import type { AuthUser, Role } from '@/lib/types'

export interface AuthGateway {
  login(username: string, password: string): Promise<AuthUser>
  me(): Promise<AuthUser>
  logout(): Promise<void>
  setupAccount(email: string, password: string): Promise<void>
  checkEmail(email: string): Promise<{ registered: boolean }>
  resetPassword(email: string, password: string): Promise<void>
}

export interface AuthUserRow extends AuthUser {
  password?: string
}
export interface AuthGatewayMockSeed {
  currentUser: AuthUser
  users: AuthUserRow[]
}