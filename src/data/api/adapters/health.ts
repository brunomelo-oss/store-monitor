import { apiClient } from '@/data/api-client'
import type { HealthGateway } from '../../gateways'
import type { HealthReport } from '@/lib/types'

export const apiHealthGateway: HealthGateway = {
  check() {
    return apiClient<HealthReport>('/v1/health')
  },
}