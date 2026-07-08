import { apiClient } from './api-client'

export interface NotificationItem {
  id: number
  type: string
  title: string
  message: string
  read: boolean
  appId?: number
  createdAt: string
}

export const notificationsService = {
  async list(skip = 0, take = 20) {
    return apiClient<NotificationItem[]>(`/v1/notifications?skip=${skip}&take=${take}`)
  },

  async countUnread() {
    return apiClient<{ count: number }>('/v1/notifications/count-unread')
  },

  async markAsRead(id: number) {
    return apiClient<NotificationItem>(`/v1/notifications/${id}/read`, { method: 'PATCH' })
  },

  async markAllAsRead() {
    return apiClient<{ count: number }>('/v1/notifications/read-all', { method: 'PATCH' })
  },
}
