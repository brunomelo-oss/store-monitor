import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gateways } from '@/data'

export const CONNECTIONS_KEY = ['store-connections'] as const

export function useConnections() {
  return useQuery({
    queryKey: CONNECTIONS_KEY,
    queryFn: () => gateways.connections.list(),
  })
}

export function useCreateConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof gateways.connections.create>[0]) => gateways.connections.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONNECTIONS_KEY }),
  })
}

export function useUpdateConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Parameters<typeof gateways.connections.update>[1] }) =>
      gateways.connections.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONNECTIONS_KEY }),
  })
}

export function useDeleteConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => gateways.connections.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONNECTIONS_KEY }),
  })
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (id: number) => gateways.connections.test(id),
  })
}