import { apiClient } from '@/data/api-client'
import type { ActivityGateway } from '../../gateways'
import type { ActivityItem } from '@/lib/types'

export const apiActivityGateway: ActivityGateway = {
  list(opts) {
    const params = new URLSearchParams()
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.types?.length) params.set('types', opts.types.join(','))
    const qs = params.toString()
    return apiClient<ActivityItem[]>(`/v1/activity${qs ? `?${qs}` : ''}`)
  },
}