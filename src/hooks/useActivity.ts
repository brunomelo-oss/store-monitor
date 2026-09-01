import { useQuery } from '@tanstack/react-query'
import { gateways } from '@/data'
import type { ActivityType } from '@/lib/types'

export const ACTIVITY_KEY = ['activity'] as const

export function useActivity(opts?: { types?: ActivityType[]; limit?: number }) {
  return useQuery({
    queryKey: [...ACTIVITY_KEY, opts?.types, opts?.limit] as const,
    queryFn: () => gateways.activity.list(opts),
    staleTime: 15_000,
  })
}