import type { AuthUser, Role } from '@/lib/types'

export interface AuthGateway {
  login(username: string, password: string): Promise<AuthUser>
  me(): Promise<AuthUser>
  logout(): Promise<void>
  setupAccount(email: string, password: string, token: string): Promise<void>
  checkEmail(email: string): Promise<{ registered: boolean }>
  forgotPassword(email: string): Promise<void>
  resetPassword(token: string, password: string): Promise<void>
  changePassword(currentPassword: string, newPassword: string): Promise<void>
}

export interface AuthUserRow extends AuthUser {
  password?: string
}
export interface AuthGatewayMockSeed {
  currentUser: AuthUser
  users: AuthUserRow[]
}