import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storeConnectionsService } from '@/services/store-connections.service'

const CONNECTIONS_KEY = ['store-connections'] as const

export function useStoreConnections() {
  return useQuery({
    queryKey: CONNECTIONS_KEY,
    queryFn: storeConnectionsService.list,
    staleTime: 30_000,
  })
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (id: number) => storeConnectionsService.test(id),
  })
}

export function useCreateConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { store: string; label: string; credentials: Record<string, unknown> }) =>
      storeConnectionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_KEY })
    },
  })
}

export function useDeleteConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => storeConnectionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_KEY })
    },
  })
}
