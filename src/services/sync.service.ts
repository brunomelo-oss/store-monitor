import { apiClient } from './api-client'

export interface SyncHistoryItem {
  id: number
  appId: number
  store: string
  type: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL'
  triggerType: string
  executionId: string
  changesDetected: number
  startedAt: string
  completedAt: string | null
  message?: string
}

export interface SyncJob {
  id: number
  type: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'IGNORED'
  payload?: Record<string, unknown>
  retryCount: number
  maxRetries: number
  lastError?: string
  duration?: number
  lastRetryAt?: string
  triggerType: string
  startedAt?: string
  completedAt?: string
  createdAt: string
}

export interface TriggerSyncRequest {
  appId: number
  store: 'GOOGLE' | 'APPLE'
  types: string[]
}

export const syncService = {
  async triggerSync(data: TriggerSyncRequest) {
    return apiClient<{ appId: number; store: string; status: string; duration: number }>('/v1/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async listJobs() {
    return apiClient<SyncJob[]>('/v1/sync/jobs')
  },

  async getJob(id: number) {
    return apiClient<SyncJob>(`/v1/sync/jobs/${id}`)
  },

  async retryJob(id: number) {
    return apiClient<{ ok: boolean }>(`/v1/sync/jobs/${id}/retry`, { method: 'POST' })
  },

  async ignoreJob(id: number) {
    return apiClient<{ ok: boolean }>(`/v1/sync/jobs/${id}/ignore`, { method: 'POST' })
  },

  async deleteJob(id: number) {
    return apiClient<{ ok: boolean }>(`/v1/sync/jobs/${id}`, { method: 'DELETE' })
  },

  async listHistory() {
    return apiClient<SyncHistoryItem[]>('/v1/sync/history')
  },

  async getHistory(id: number) {
    return apiClient<SyncHistoryItem>(`/v1/sync/history/${id}`)
  },
}
