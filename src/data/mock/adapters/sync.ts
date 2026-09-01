import { mockSyncHistory, mockSyncJobs } from '../mock-data'
import { withLatency, clone, nextId } from '../helpers'
import type { SyncGateway } from '../../gateways'
import type { StoreKind, SyncJob } from '@/lib/types'

let jobs: SyncJob[] = clone(mockSyncJobs)

export const mockSyncGateway: SyncGateway = {
  async listJobs() {
    return withLatency(clone(jobs))
  },
  async listHistory(appId) {
    let items = clone(mockSyncHistory)
    if (appId) items = items.filter(h => h.appId === appId)
    return withLatency(items)
  },
  async triggerSync(appId, store) {
    const newJob: SyncJob = {
      id: nextId(jobs),
      appId,
      appName: store === 'both' ? 'Sync' : '',
      store: store === 'both' ? 'GOOGLE' : store,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      finishedAt: null,
    }
    jobs = [newJob, ...jobs]
    return withLatency(undefined as unknown as void)
  },
  async retryJob(id) {
    jobs = jobs.map(j => j.id === id ? { ...j, status: 'PENDING', message: null, createdAt: new Date().toISOString() } : j)
    const job = jobs.find(j => j.id === id)
    return withLatency(clone(job!))
  },
  async deleteJob(id) {
    jobs = jobs.filter(j => j.id !== id)
    return withLatency(undefined as unknown as void)
  },
}

export function getMockSyncJobs(): SyncJob[] {
  return clone(jobs)
}
export function setMockSyncJobs(next: SyncJob[]) {
  jobs = clone(next)
}
export function getAppNameById(appId: number, fallback: string): string {
  return jobs.find(j => j.appId === appId)?.appName || fallback
}
export type { StoreKind }