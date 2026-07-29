import { useQuery } from '@tanstack/react-query'
import { syncService } from '@/services/sync.service'
import { logError } from '@/lib/logger'

export function useSyncHistory(appId?: number) {
  return useQuery({
    queryKey: appId ? ['sync-history', appId] : ['sync-history'],
    queryFn: async () => {
      try {
        return await syncService.listHistory(appId)
      } catch (e) { logError('useSyncHistory', e)
        return []
      }
    },
    initialData: [],
    staleTime: 15_000,
  })
}

export function useSyncHistoryDetail(id: number) {
  return useQuery({
    queryKey: ['sync-history', id] as const,
    queryFn: async () => {
      try {
        return await syncService.getHistory(id)
      } catch {
        return null
      }
    },
    enabled: !!id,
  })
}
