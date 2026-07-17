import { useQuery } from '@tanstack/react-query'
import { syncService } from '@/services/sync.service'

const SYNC_HISTORY_KEY = ['sync-history'] as const

export function useSyncHistory() {
  return useQuery({
    queryKey: SYNC_HISTORY_KEY,
    queryFn: async () => {
      try {
        return await syncService.listHistory()
      } catch {
        return []
      }
    },
    initialData: [],
    staleTime: 15_000,
  })
}

export function useSyncHistoryDetail(id: number) {
  return useQuery({
    queryKey: [...SYNC_HISTORY_KEY, id] as const,
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
