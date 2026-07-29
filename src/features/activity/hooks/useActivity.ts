import { useQuery } from '@tanstack/react-query'
import { activityService } from '@/services/activity.service'
import { MOCK_ACTIVITIES } from '@/lib/mock-data'
import { logError } from '@/lib/logger'

export function useActivity(limit = 50, filters?: { entity?: string; entityId?: number }) {
  return useQuery({
    queryKey: filters ? ['activity', { limit, ...filters }] : ['activity', { limit }],
    queryFn: async () => {
      try {
        return await activityService.list(limit, 0, filters)
      } catch (e) { logError('useActivity', e)
        return MOCK_ACTIVITIES
      }
    },
    initialData: MOCK_ACTIVITIES,
    staleTime: 15_000,
  })
}
