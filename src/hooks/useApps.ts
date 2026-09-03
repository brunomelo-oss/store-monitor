import { useQuery } from '@tanstack/react-query'
import { gateways } from '@/data'

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
