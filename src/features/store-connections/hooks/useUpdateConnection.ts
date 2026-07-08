import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storeConnectionsService } from '@/services/store-connections.service'

export function useUpdateConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { label?: string; credentials?: Record<string, unknown> } }) =>
      storeConnectionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-connections'] })
    },
  })
}
