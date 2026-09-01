import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gateways } from '@/data'
import type { NotificationCategory, NotificationPriority } from '@/lib/types'

export const NOTIFICATIONS_KEY = ['notifications'] as const

export interface NotificationsFilter {
  search?: string
  category?: NotificationCategory | 'all'
  priority?: NotificationPriority | 'all'
  limit?: number
}

export function useNotifications(opts?: NotificationsFilter) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, opts?.search, opts?.category, opts?.priority, opts?.limit] as const,
    queryFn: () => gateways.notifications.list(opts),
    staleTime: 15_000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread'] as const,
    queryFn: () => gateways.notifications.unreadCount(),
    refetchInterval: 30_000,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => gateways.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => gateways.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}