import { useQuery } from '@tanstack/react-query'
import { gateways } from '@/data'
import type { HealthReport } from '@/lib/types'

export const HEALTH_KEY = ['health'] as const

export function useHealth() {
  return useQuery({
    queryKey: HEALTH_KEY,
    queryFn: () => gateways.health.check(),
    refetchInterval: 30_000,
    placeholderData: (prev: HealthReport | undefined) => prev,
  })
}