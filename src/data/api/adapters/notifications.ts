import { apiClient } from '@/data/api-client'
import type { NotificationsGateway } from '../../gateways'
import type { NotificationItem } from '@/lib/types'

export const apiNotificationsGateway: NotificationsGateway = {
  list(opts) {
    const params = new URLSearchParams()
    if (opts?.search) params.set('search', opts.search)
    if (opts?.category && opts.category !== 'all') params.set('category', opts.category)
    if (opts?.priority && opts.priority !== 'all') params.set('priority', opts.priority)
    if (opts?.limit) params.set('limit', String(opts.limit))
    const qs = params.toString()
    return apiClient<NotificationItem[]>(`/v1/notifications${qs ? `?${qs}` : ''}`)
  },
  unreadCount() {
    return apiClient<number>('/v1/notifications/count-unread')
  },
  markAsRead(id) {
    return apiClient<void>(`/v1/notifications/${id}/read`, { method: 'PATCH' })
  },
  markAllAsRead() {
    return apiClient<void>('/v1/notifications/read-all', { method: 'PATCH' })
  },
}