import { appRepository } from '../repositories'
import { NotFoundError, ValidationError } from '../lib/errors'
import { withTx } from '../lib/prisma'
import { getLogger } from '../lib/logger'
import { AuditService } from './audit.service'
import { AppResponse, CreateAppRequest, UpdateAppRequest } from '../types'

export class AppService {
  private audit: AuditService
  private logger = getLogger()

  constructor() {
    this.audit = new AuditService()
  }

  private toResponse(app: any): AppResponse {
    const lastSync = Array.isArray(app.syncHistory) && app.syncHistory.length > 0
      ? app.syncHistory[0]
      : null
    return {
      id: app.id,
      name: app.name,
      region: app.region,
      icon: app.icon,
      packageName: app.packageName,
      bundleId: app.bundleId,
      city: app.city,
      state: app.state,
      googleAccount: app.googleAccount,
      appleAccount: app.appleAccount,
      playStore: {
        status: app.playStatus || 'unpublished',
        version: app.playVersion || '',
        lastUpdate: app.playLastUpdate || '',
      },
      appStore: {
        status: app.appStatus || 'unpublished',
        version: app.appVersion || '',
        lastUpdate: app.appLastUpdate || '',
      },
      installations: app.installations || 0,
      rating: app.rating || 0,
      pinned: app.pinned || false,
      sortOrder: app.sortOrder || 0,
      storeConnectionId: app.storeConnectionId ?? null,
      lastSyncAt: lastSync ? (lastSync.startedAt?.toISOString?.() || lastSync.startedAt || null) : null,
      lastSyncStatus: lastSync ? (lastSync.status || null) : null,
      createdAt: app.createdAt?.toISOString?.() || app.createdAt || '',
      updatedAt: app.updatedAt?.toISOString?.() || app.updatedAt || '',
    }
  }

  private toDb(data: CreateAppRequest | UpdateAppRequest): Record<string, unknown> {
    const db: Record<string, unknown> = {}
    if (data.name !== undefined) db.name = data.name
    if (data.region !== undefined) db.region = data.region
    if (data.icon !== undefined) db.icon = data.icon
    if (data.packageName !== undefined) db.packageName = data.packageName
    if (data.bundleId !== undefined) db.bundleId = data.bundleId
    if (data.city !== undefined) db.city = data.city
    if (data.state !== undefined) db.state = data.state
    if (data.googleAccount !== undefined) db.googleAccount = data.googleAccount
    if (data.appleAccount !== undefined) db.appleAccount = data.appleAccount
    if (data.installations !== undefined) db.installations = data.installations
    if (data.rating !== undefined) db.rating = data.rating
    if (data.storeConnectionId !== undefined) db.storeConnectionId = data.storeConnectionId

    if ('playStore' in data && data.playStore) {
      db.playStatus = data.playStore.status
      db.playVersion = data.playStore.version
      db.playLastUpdate = data.playStore.lastUpdate
    }
    if ('appStore' in data && data.appStore) {
      db.appStatus = data.appStore.status
      db.appVersion = data.appStore.version
      db.appLastUpdate = data.appStore.lastUpdate
    }

    return db
  }

  async list(): Promise<AppResponse[]> {
    const apps = await appRepository.findAllOrdered()
    return apps.map(this.toResponse)
  }

  async getById(id: number): Promise<AppResponse> {
    const app = await appRepository.findById(id)
    if (!app) {
      throw new NotFoundError('App')
    }
    return this.toResponse(app)
  }

  async create(data: CreateAppRequest, userId?: number, ip?: string): Promise<AppResponse> {
    if (!data.name) {
      throw new ValidationError('Nome é obrigatório')
    }
    const maxOrder = await appRepository.getMaxSortOrder()

    const app = await withTx(async (tx) => {
      const created = await tx.app.create({
        data: { ...this.toDb(data) as any, sortOrder: maxOrder + 1 },
      })
      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'CREATE_APP',
          entity: 'App',
          entityId: created.id,
          metadata: { name: created.name },
          ip,
          organizationId: created.organizationId,
        } as any,
      })
      return created
    })

    this.logger.info({ appId: app.id, name: app.name }, 'App created')
    return this.toResponse(app)
  }

  async update(id: number, data: UpdateAppRequest, userId?: number, ip?: string): Promise<AppResponse> {
    const existing = await appRepository.findById(id)
    if (!existing) {
      throw new NotFoundError('App')
    }

    const app = await withTx(async (tx) => {
      const updated = await tx.app.update({ where: { id }, data: this.toDb(data) as any })
      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'UPDATE_APP',
          entity: 'App',
          entityId: id,
          metadata: { changes: Object.keys(data) },
          ip,
          organizationId: existing.organizationId,
        } as any,
      })
      return updated
    })

    this.logger.info({ appId: id }, 'App updated')
    return this.toResponse(app)
  }

  async delete(id: number, userId?: number, ip?: string): Promise<void> {
    const existing = await appRepository.findById(id)
    if (!existing) {
      throw new NotFoundError('App')
    }

    await withTx(async (tx) => {
      await tx.app.delete({ where: { id } })
      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'DELETE_APP',
          entity: 'App',
          entityId: id,
          metadata: { name: existing.name },
          ip,
          organizationId: existing.organizationId,
        } as any,
      })
    })

    this.logger.info({ appId: id, name: existing.name }, 'App deleted')
  }

  async togglePin(id: number, userId?: number, ip?: string): Promise<AppResponse> {
    const app = await appRepository.findById(id)
    if (!app) {
      throw new NotFoundError('App')
    }

    if (!app.pinned) {
      const pinnedCount = await appRepository.countPinned()
      if (pinnedCount >= 3) {
        throw new ValidationError('Máximo de 3 apps fixados')
      }
    }

    const updated = await withTx(async (tx) => {
      const result = await tx.app.update({ where: { id }, data: { pinned: !app.pinned } as any })
      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'TOGGLE_PIN_APP',
          entity: 'App',
          entityId: id,
          metadata: { pinned: !app.pinned },
          ip,
          organizationId: app.organizationId,
        } as any,
      })
      return result
    })

    return this.toResponse(updated)
  }

  async move(id: number, direction: 1 | -1, userId?: number, ip?: string): Promise<AppResponse[]> {
    const app = await appRepository.findById(id)
    if (!app) {
      throw new NotFoundError('App')
    }

    const unpinned = await appRepository.findMany({
      where: { pinned: false },
      orderBy: { sortOrder: 'asc' },
    }) as any[]

    const idx = unpinned.findIndex((a: any) => a.id === id)
    if (idx === -1) {
      throw new NotFoundError('App na lista')
    }

    const target = idx + direction
    if (target < 0 || target >= unpinned.length) {
      throw new ValidationError('Movimento inválido')
    }

    await withTx(async (tx) => {
      const a1 = unpinned[idx]
      const a2 = unpinned[target]
      await tx.app.update({ where: { id: a1.id }, data: { sortOrder: a2.sortOrder } })
      await tx.app.update({ where: { id: a2.id }, data: { sortOrder: a1.sortOrder } })
      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'MOVE_APP',
          entity: 'App',
          entityId: id,
          metadata: { direction },
          ip,
          organizationId: app.organizationId,
        } as any,
      })
    })

    return this.list()
  }

  async bulkReplace(apps: CreateAppRequest[], userId?: number, ip?: string): Promise<AppResponse[]> {
    const dbApps = apps.map((app, index) => ({
      ...this.toDb(app) as any,
      sortOrder: index,
    }))

    const result = await withTx(async (tx) => {
      await tx.app.deleteMany()
      for (const data of dbApps) {
        await tx.app.create({ data })
      }
      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'BULK_REPLACE_APPS',
          entity: 'App',
          entityId: null,
          metadata: { count: apps.length },
          ip,
          organizationId: 1,
        } as any,
      })
      return tx.app.findMany({
        orderBy: [{ pinned: 'desc' }, { sortOrder: 'asc' }],
      })
    })

    this.logger.info({ count: apps.length }, 'Apps bulk replaced')
    return result.map((app) => this.toResponse(app))
  }
}
