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

type HandlerMap = Map<SyncEventType, Set<SyncEventHandler>>

const handlers: HandlerMap = new Map()

export const syncEventBus = {
  on(type: SyncEventType, handler: SyncEventHandler): void {
    if (!handlers.has(type)) handlers.set(type, new Set())
    handlers.get(type)!.add(handler)
  },

  off(type: SyncEventType, handler: SyncEventHandler): void {
    handlers.get(type)?.delete(handler)
  },

  async emit(event: SyncEvent): Promise<void> {
    const h = handlers.get(event.type)
    if (!h || h.size === 0) {
      logger().debug({ type: event.type, executionId: event.executionId }, 'No handlers for sync event')
      return
    }
    const results = await Promise.allSettled(Array.from(h).map((fn) => fn(event)))
    for (const result of results) {
      if (result.status === 'rejected') {
        logger().error({ err: result.reason, type: event.type, executionId: event.executionId }, 'Sync event handler failed')
      }
    }
  },

  removeAll(): void {
    handlers.clear()
  },
}
