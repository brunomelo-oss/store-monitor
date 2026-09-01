import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gateways } from '@/data'
import type { StoreKind } from '@/lib/types'

export const SYNC_KEY = ['sync'] as const

export function useSyncJobs() {
  return useQuery({
    queryKey: [...SYNC_KEY, 'jobs'] as const,
    queryFn: () => gateways.sync.listJobs(),
    refetchInterval: 20_000,
  })
}

export function useSyncHistory(appId?: number) {
  return useQuery({
    queryKey: [...SYNC_KEY, 'history', appId] as const,
    queryFn: () => gateways.sync.listHistory(appId),
    staleTime: 15_000,
  })
}

export function useTriggerSync() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appId, store }: { appId: number; store: 'both' | StoreKind }) => gateways.sync.triggerSync(appId, store),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYNC_KEY })
    },
  })
}

export function useRetryJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => gateways.sync.retryJob(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SYNC_KEY }),
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => gateways.sync.deleteJob(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SYNC_KEY }),
  })
}