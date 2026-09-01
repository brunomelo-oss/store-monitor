import { apiClient } from '@/data/api-client'
import type { SyncGateway } from '../../gateways'
import type { StoreKind, SyncHistoryItem, SyncJob } from '@/lib/types'

export const apiSyncGateway: SyncGateway = {
  listJobs() {
    return apiClient<SyncJob[]>('/v1/sync/jobs')
  },
  listHistory(appId) {
    const qs = appId ? `?appId=${appId}` : ''
    return apiClient<SyncHistoryItem[]>(`/v1/sync/history${qs}`)
  },
  triggerSync(appId, store: 'both' | StoreKind) {
    return apiClient<void>('/v1/sync', { method: 'POST', body: JSON.stringify({ appId, store }) })
  },
  retryJob(id) {
    return apiClient<SyncJob>(`/v1/sync/jobs/${id}/retry`, { method: 'POST' })
  },
  deleteJob(id) {
    return apiClient<void>(`/v1/sync/jobs/${id}`, { method: 'DELETE' })
  },
}