import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService, type NotificationItem } from '@/services/notifications.service'
import { MOCK_NOTIFICATIONS, MOCK_UNREAD_COUNT } from '@/lib/mock-data'

const NOTIFICATIONS_KEY = ['notifications'] as const

export function useNotifications(take = 20) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, { take }] as const,
    queryFn: async () => {
      try {
        return await notificationsService.list(0, take)
      } catch {
        return MOCK_NOTIFICATIONS as NotificationItem[]
      }
    },
    staleTime: 15_000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread'] as const,
    queryFn: async () => {
      try {
        return await notificationsService.countUnread()
      } catch {
        return MOCK_UNREAD_COUNT
      }
    },
    refetchInterval: 30_000,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}
