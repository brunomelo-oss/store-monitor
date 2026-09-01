import { mockNotifications } from '../mock-data'
import { withLatency, clone } from '../helpers'
import type { NotificationsGateway } from '../../gateways'
import type { NotificationItem } from '@/lib/types'

let notifications: NotificationItem[] = clone(mockNotifications)

export const mockNotificationsGateway: NotificationsGateway = {
  async list(opts) {
    let items = clone(notifications)
    if (opts?.category && opts.category !== 'all') {
      items = items.filter(n => n.category === opts.category)
    }
    if (opts?.priority && opts.priority !== 'all') {
      items = items.filter(n => n.priority === opts.priority)
    }
    if (opts?.search) {
      const q = opts.search.toLowerCase()
      items = items.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))
    }
    items = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (opts?.limit) items = items.slice(0, opts.limit)
    return withLatency(items)
  },
  async unreadCount() {
    return withLatency(notifications.filter(n => !n.read).length)
  },
  async markAsRead(id) {
    notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    return withLatency(undefined as unknown as void)
  },
  async markAllAsRead() {
    notifications = notifications.map(n => ({ ...n, read: true }))
    return withLatency(undefined as unknown as void)
  },
}

export function getMockNotifications(): NotificationItem[] {
  return clone(notifications)
}