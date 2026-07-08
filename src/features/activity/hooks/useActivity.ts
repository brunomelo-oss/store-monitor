import { useQuery } from '@tanstack/react-query'
import { activityService } from '@/services/activity.service'

export function useActivity(limit = 50) {
  return useQuery({
    queryKey: ['activity', { limit }] as const,
    queryFn: () => activityService.list(limit),
    staleTime: 15_000,
  })
}
