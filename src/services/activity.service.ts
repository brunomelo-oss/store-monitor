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
  async list(limit = 50, offset = 0) {
    return apiClient<ActivityItem[]>(`/v1/activity?limit=${limit}&offset=${offset}`)
  },
}
