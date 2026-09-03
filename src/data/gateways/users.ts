import type { Role, User, Invite } from '@/lib/types'

export interface UsersGateway {
  list(): Promise<User[]>
  invites(): Promise<Invite[]>
  createInvite(email: string): Promise<Invite>
  deleteInvite(id: number): Promise<void>
  updateRole(id: number, role: Role): Promise<User>
  updatePassword(id: number, password: string): Promise<void>
  deleteUser(id: number): Promise<void>
}