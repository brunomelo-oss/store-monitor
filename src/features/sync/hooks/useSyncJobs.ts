import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { syncService } from '@/services/sync.service'

const SYNC_JOBS_KEY = ['sync-jobs'] as const

export function useSyncJobs() {
  return useQuery({
    queryKey: SYNC_JOBS_KEY,
    queryFn: async () => {
      try {
        return await syncService.listJobs()
      } catch {
        return []
      }
    },
    initialData: [],
    staleTime: 10_000,
  })
}

export function useRetryJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: number) => syncService.retryJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYNC_JOBS_KEY })
    },
  })
}

export function useIgnoreJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: number) => syncService.ignoreJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYNC_JOBS_KEY })
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: number) => syncService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYNC_JOBS_KEY })
    },
  })
}
