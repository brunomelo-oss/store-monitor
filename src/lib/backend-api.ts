// Backward compatibility wrapper
// New code should import from '@/services/*' directly

import { authService } from '@/services/auth.service'
import { appsService } from '@/services/apps.service'
import { usersService } from '@/services/users.service'
import { App, Invite } from '@/types'

export const backendApi = {
  // Auth
  async login(username: string, password: string) {
    const user = await authService.login(username, password)
    return { user }
  },

  async logout() {
    await authService.logout()
  },

  async register(email: string, password: string) {
    await authService.register(email, password)
  },

  async me() {
    return authService.me()
  },

  async refresh() {
    return authService.refresh()
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await authService.changePassword(currentPassword, newPassword)
  },

  async checkEmail(email: string) {
    return authService.checkEmail(email)
  },

  async resetPassword(email: string, password: string) {
    await authService.resetPassword(email, password)
  },

  // Apps
  async getApps(): Promise<App[]> {
    return appsService.list()
  },

  async createApp(app: Partial<App>): Promise<App> {
    return appsService.create(app)
  },

  async updateApp(id: number, data: Partial<App>): Promise<App> {
    return appsService.update(id, data)
  },

  async deleteApp(id: number): Promise<void> {
    await appsService.delete(id)
  },

  async togglePin(id: number): Promise<App> {
    return appsService.togglePin(id)
  },

  async moveApp(id: number, direction: 1 | -1): Promise<App[]> {
    return appsService.move(id, direction)
  },

  async bulkReplace(apps: Partial<App>[]): Promise<App[]> {
    return appsService.bulkReplace(apps)
  },

  // Users (admin)
  async getUsers() {
    return usersService.list()
  },

  async createUser(email: string, password: string, role: string) {
    return usersService.create(email, password, role)
  },

  async updateUserRole(id: number, role: string) {
    return usersService.updateRole(id, role)
  },

  async updateUserPassword(id: number, password: string) {
    await usersService.updatePassword(id, password)
  },

  async deleteUser(id: number) {
    await usersService.delete(id)
  },

  // Invites (admin)
  async getInvites(): Promise<Invite[]> {
    return usersService.getInvites()
  },

  async createInvite(email: string): Promise<Invite> {
    return usersService.createInvite(email)
  },

  async deleteInvite(id: number): Promise<void> {
    await usersService.deleteInvite(id)
  },

  async checkInvite(email: string) {
    return usersService.checkInvite(email)
  },
}
