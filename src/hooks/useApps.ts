import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gateways } from '@/data'
import type { App } from '@/lib/types'

export const APPS_KEY = ['apps'] as const

export function useApps() {
  return useQuery({
    queryKey: APPS_KEY,
    queryFn: () => gateways.apps.list(),
    staleTime: 30_000,
  })
}

export function useApp(id: number) {
  return useQuery({
    queryKey: [...APPS_KEY, id] as const,
    queryFn: () => gateways.apps.getById(id),
    enabled: !!id,
  })
}

export function useCreateApp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof gateways.apps.create>[0]) => gateways.apps.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPS_KEY }),
  })
}

export function useUpdateApp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Parameters<typeof gateways.apps.update>[1] }) =>
      gateways.apps.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPS_KEY }),
  })
}

export function useDeleteApp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => gateways.apps.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPS_KEY }),
  })
}

export function useTogglePin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => gateways.apps.togglePin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPS_KEY }),
  })
}

export function useMoveApp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, direction }: { id: number; direction: 'up' | 'down' }) => gateways.apps.move(id, direction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPS_KEY }),
  })
}