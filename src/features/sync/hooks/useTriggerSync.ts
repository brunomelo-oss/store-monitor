import { useMutation, useQueryClient } from '@tanstack/react-query'
import { syncService, TriggerSyncRequest } from '@/services/sync.service'

export function useTriggerSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TriggerSyncRequest) => syncService.triggerSync(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-history'] })
      queryClient.invalidateQueries({ queryKey: ['sync-jobs'] })
    },
  })
}
