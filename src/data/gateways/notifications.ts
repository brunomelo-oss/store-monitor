import type { NotificationItem, NotificationCategory, NotificationPriority } from '@/lib/types'

export interface NotificationsGateway {
  list(opts?: { search?: string; category?: NotificationCategory | 'all'; priority?: NotificationPriority | 'all'; limit?: number }): Promise<NotificationItem[]>
  unreadCount(): Promise<number>
  markAsRead(id: number): Promise<void>
  markAllAsRead(): Promise<void>
}