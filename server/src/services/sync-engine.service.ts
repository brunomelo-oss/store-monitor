import crypto from 'crypto'
import { StoreType, SyncType, SyncStatus, SyncTriggerType } from '@prisma/client'
import { appRepository, syncHistoryRepository, storeConnectionRepository, connectionConfigRepository } from '../repositories'
import { SyncError } from '../lib/errors'
import { getLogger } from '../lib/logger'
import { withTx } from '../lib/prisma'
import { ProviderRegistry } from '../providers'
import { syncEventBus, SyncEvent } from '../lib/sync-events'
import { SyncResult } from '../types'

interface SyncRequest {
  appId: number
  store: StoreType
  types: SyncType[]
  organizationId: number
  triggerType?: SyncTriggerType
}

interface SyncContext {
  app: any
  provider: any
  executionId: string
  syncId: number
}

export class SyncEngineService {
  private logger = getLogger()

  async executeSync(request: SyncRequest): Promise<SyncResult> {
    const startTime = Date.now()
    const executionId = crypto.randomUUID()
    const triggerType = request.triggerType ?? SyncTriggerType.MANUAL

    const app = await appRepository.findById(request.appId)
    if (!app) {
      throw new SyncError('App não encontrado', { appId: request.appId })
    }

    if (app.organizationId !== request.organizationId) {
      throw new SyncError('App não pertence a esta organização', { appId: request.appId })
    }

    const storeConnection = app.storeConnectionId
      ? await storeConnectionRepository.findById(app.storeConnectionId)
      : null

    const provider = ProviderRegistry.getInstance().resolve(request.store)

    const syncHistory = await syncHistoryRepository.create({
      organizationId: request.organizationId,
      appId: request.appId,
      store: request.store,
      type: request.types[0],
      status: SyncStatus.PENDING,
      executionId,
      triggerType,
    } as any)

    const syncId = syncHistory.id
    const context: SyncContext = { app, provider, executionId, syncId }

    const emit = (type: SyncEvent['type'], data?: Record<string, unknown>, error?: string) => {
      const event: SyncEvent = {
        type,
        syncId,
        appId: request.appId,
        organizationId: request.organizationId,
        store: request.store,
        executionId,
        timestamp: new Date(),
        data,
        error,
        duration: Date.now() - startTime,
      }
      syncEventBus.emit(event)
    }

    try {
      await syncHistoryRepository.update(syncId, { status: SyncStatus.RUNNING } as any)

      emit('SYNC_STARTED')

      if (storeConnection) {
        const config = await connectionConfigRepository.getDecryptedConfig(storeConnection.id)
        await provider.initialize(config)
      } else {
        await provider.initialize({})
      }

      const validation = await provider.validateConnection()
      emit('PROVIDER_VALIDATED', { valid: validation.valid, message: validation.message })

      for (const type of request.types) {
        await this.syncByType(type, context, emit)
      }

      const duration = Date.now() - startTime

      await withTx(async (tx) => {
        await tx.syncHistory.update({
          where: { id: syncId },
          data: {
            status: SyncStatus.SUCCESS,
            completedAt: new Date(),
          },
        })

        if (storeConnection) {
          await tx.storeConnection.update({
            where: { id: storeConnection.id },
            data: { lastSyncAt: new Date() },
          })
        }
      })

      emit('SYNC_COMPLETED', { types: request.types, duration })

      this.logger.info({ executionId, appId: request.appId, store: request.store, duration }, 'Sync completed')

      return {
        appId: request.appId,
        store: request.store,
        type: request.types.join(','),
        status: SyncStatus.SUCCESS,
        duration,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const message = error instanceof Error ? error.message : 'Unknown error'

      await syncHistoryRepository.update(syncId, {
        status: SyncStatus.FAILED,
        message,
        completedAt: new Date(),
      } as any)

      emit('SYNC_FAILED', undefined, message)

      this.logger.error({ executionId, appId: request.appId, store: request.store, err: error }, 'Sync failed')

      throw new SyncError(`Sync falhou: ${message}`, {
        appId: request.appId,
        store: request.store,
        executionId,
        duration,
      })
    }
  }

  private async syncByType(type: SyncType, context: SyncContext, emit: (type: SyncEvent['type'], data?: Record<string, unknown>, error?: string) => void): Promise<void> {
    const { app, provider, executionId } = context

    switch (type) {
      case SyncType.APP_INFO: {
        const result = await provider.syncAppInfo(app.id)
        emit('APP_INFO_UPDATED', result.data)
        break
      }
      case SyncType.VERSIONS: {
        const result = await provider.syncVersions(app.id)
        emit('VERSIONS_UPDATED', result.data)
        break
      }
      case SyncType.BUILDS: {
        const result = await provider.syncBuilds(app.id)
        emit('BUILDS_UPDATED', result.data)
        break
      }
      case SyncType.REVIEWS: {
        const result = await provider.syncReviews(app.id)
        emit('REVIEWS_UPDATED', result.data)
        break
      }
      case SyncType.RATINGS: {
        const result = await provider.syncRatings(app.id)
        emit('RATINGS_UPDATED', result.data)
        break
      }
      case SyncType.ANALYTICS: {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const result = await provider.syncAnalytics(app.id, since)
        emit('ANALYTICS_UPDATED', result.data)
        break
      }
      case SyncType.PUBLICATIONS: {
        await provider.syncTracks(app.id)
        const releasesResult = await provider.syncReleases(app.id)
        emit('RELEASES_UPDATED', releasesResult.data)
        break
      }
    }
  }

  async validateProviderConnection(organizationId: number, storeConnectionId: number): Promise<boolean> {
    const connection = await storeConnectionRepository.findByIdAndOrganization(storeConnectionId, organizationId)
    if (!connection) {
      throw new SyncError('Store connection not found')
    }

    const config = await connectionConfigRepository.getDecryptedConfig(storeConnectionId)
    const provider = ProviderRegistry.getInstance().resolve(connection.store)
    await provider.initialize(config)
    const result = await provider.validateConnection()
    return result.valid
  }
}
