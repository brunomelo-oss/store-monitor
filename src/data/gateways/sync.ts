import type { StoreKind, SyncHistoryItem, SyncJob } from '@/lib/types'

export interface SyncGateway {
  listJobs(): Promise<SyncJob[]>
  listHistory(appId?: number): Promise<SyncHistoryItem[]>
  triggerSync(appId: number, store: 'both' | StoreKind): Promise<void>
  retryJob(id: number): Promise<SyncJob>
  deleteJob(id: number): Promise<void>
}