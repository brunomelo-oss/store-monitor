import { StoreType, SyncType } from '@prisma/client'
import { getLogger } from './logger'

function logger() {
  return getLogger()
}

export type SyncEventType =
  | 'SYNC_STARTED'
  | 'PROVIDER_VALIDATED'
  | 'APP_INFO_UPDATED'
  | 'VERSIONS_UPDATED'
  | 'BUILDS_UPDATED'
  | 'TRACKS_UPDATED'
  | 'RELEASES_UPDATED'
  | 'REVIEWS_UPDATED'
  | 'RATINGS_UPDATED'
  | 'ANALYTICS_UPDATED'
  | 'SYNC_COMPLETED'
  | 'SYNC_FAILED'

export interface SyncEvent {
  type: SyncEventType
  syncId: number
  appId: number
  organizationId: number
  store: StoreType
  syncType?: SyncType
  executionId: string
  timestamp: Date
  data?: Record<string, unknown>
  error?: string
  duration?: number
}

export type SyncEventHandler = (event: SyncEvent) => Promise<void>

export class SyncEventBus {
  private handlers = new Map<SyncEventType, Set<SyncEventHandler>>()

  on(type: SyncEventType, handler: SyncEventHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)
  }

  off(type: SyncEventType, handler: SyncEventHandler): void {
    this.handlers.get(type)?.delete(handler)
  }

  async emit(event: SyncEvent): Promise<void> {
    const handlers = this.handlers.get(event.type)
    if (!handlers || handlers.size === 0) {
      logger().debug({ type: event.type, executionId: event.executionId }, 'No handlers for sync event')
      return
    }

    const results = await Promise.allSettled(
      Array.from(handlers).map((handler) => handler(event)),
    )

    for (const result of results) {
      if (result.status === 'rejected') {
        logger().error({
          err: result.reason,
          type: event.type,
          executionId: event.executionId,
        }, 'Sync event handler failed')
      }
    }
  }

  removeAll(): void {
    this.handlers.clear()
  }
}

export const syncEventBus = new SyncEventBus()
