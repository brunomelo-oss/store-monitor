import { App, User, Invite } from '@/types'

export interface AppApi {
  getApps(): Promise<App[]>
  saveApps(apps: App[]): Promise<void>
  getUsers(): Promise<User[]>
  saveUsers(users: User[]): Promise<void>
  getInvites(): Promise<Invite[]>
  saveInvites(invites: Invite[]): Promise<void>
  getTheme(): Promise<string | null>
  saveTheme(theme: string): Promise<void>
}
