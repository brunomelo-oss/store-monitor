import { apiClient } from './api-client'

export interface AuditLogItem {
  id: number
  action: string
  entity: string
  entityId: number | null
  metadata: Record<string, unknown> | null
  ip: string | null
  userId: number | null
  organizationId: number
  createdAt: string
  user?: { id: number; username: string; email: string }
}

export const auditLogService = {
  async list(params?: { entity?: string; entityId?: number; action?: string; take?: number; skip?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.entity) searchParams.set('entity', params.entity)
    if (params?.entityId) searchParams.set('entityId', String(params.entityId))
    if (params?.action) searchParams.set('action', params.action)
    if (params?.take) searchParams.set('take', String(params.take))
    if (params?.skip) searchParams.set('skip', String(params.skip))
    const qs = searchParams.toString()
    return apiClient<AuditLogItem[]>(`/v1/audit-logs${qs ? `?${qs}` : ''}`)
  },
}
