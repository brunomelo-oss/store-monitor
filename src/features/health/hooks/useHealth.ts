import { useQuery } from '@tanstack/react-query'
import { healthService } from '@/services/health.service'

export function useHealth() {
  return useQuery({
    queryKey: ['health'] as const,
    queryFn: () => healthService.check(),
    refetchInterval: 60_000,
  })
}
