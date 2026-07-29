import { apiClient } from './api-client'

export interface ActivityItem {
  id: string
  type: 'audit_log' | 'sync' | 'notification' | 'job'
  action: string
  entity: string
  entityId: number | null
  description: string
  metadata: Record<string, unknown> | null
  userId: number | null
  username: string | null
  createdAt: string
}

export const activityService = {
  async list(limit = 50, offset = 0, filters?: { entity?: string; entityId?: number }) {
    let path = `/v1/activity?limit=${limit}&offset=${offset}`
    if (filters?.entity) path += `&entity=${filters.entity}`
    if (filters?.entityId) path += `&entityId=${filters.entityId}`
    return apiClient<ActivityItem[]>(path)
  },
}
