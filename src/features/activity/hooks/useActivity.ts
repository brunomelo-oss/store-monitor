import { useQuery } from '@tanstack/react-query'
import { activityService } from '@/services/activity.service'
import { MOCK_ACTIVITIES } from '@/lib/mock-data'

export function useActivity(limit = 50) {
  return useQuery({
    queryKey: ['activity', { limit }] as const,
    queryFn: async () => {
      try {
        return await activityService.list(limit)
      } catch {
        return MOCK_ACTIVITIES
      }
    },
    initialData: MOCK_ACTIVITIES,
    staleTime: 15_000,
  })
}
