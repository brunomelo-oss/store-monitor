import type { HealthReport } from '@/lib/types'

export interface HealthGateway {
  check(): Promise<HealthReport>
}