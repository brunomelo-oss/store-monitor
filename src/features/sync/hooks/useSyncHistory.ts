import { useQuery } from '@tanstack/react-query'
import { syncService } from '@/services/sync.service'

const SYNC_HISTORY_KEY = ['sync-history'] as const

export function useSyncHistory() {
  return useQuery({
    queryKey: SYNC_HISTORY_KEY,
    queryFn: syncService.listHistory,
    staleTime: 15_000,
  })
}

export function useSyncHistoryDetail(id: number) {
  return useQuery({
    queryKey: [...SYNC_HISTORY_KEY, id] as const,
    queryFn: () => syncService.getHistory(id),
    enabled: !!id,
  })
}
