import { App, SyncHistory } from '@prisma/client'
import { appRepository } from '../repositories'
import { NotFoundError, ValidationError } from '../lib/errors'
import { withTx } from '../lib/prisma'
import { getLogger } from '../lib/logger'
import { toISO } from '../lib/utils'
import { AuditService } from './audit.service'
import { AppResponse, CreateAppRequest, UpdateAppRequest } from '../types'

type AppRow = App & { syncHistory?: SyncHistory[] }

export class AppService {
  private audit: AuditService
  private logger = getLogger()

  constructor() {
    this.audit = new AuditService()
  }

  private toResponse(app: AppRow): AppResponse {
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
      lastSyncAt: lastSync ? toISO(lastSync.startedAt, null) : null,
      lastSyncStatus: lastSync ? (lastSync.status || null) : null,
      createdAt: toISO(app.createdAt) || '',
      updatedAt: toISO(app.updatedAt) || '',
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

  async list(organizationId: number): Promise<AppResponse[]> {
    const apps = await appRepository.findAllOrdered(organizationId)
    return apps.map(this.toResponse)
  }

  async getById(id: number, organizationId: number): Promise<AppResponse> {
    const app = await appRepository.findByIdAndOrganization(id, organizationId)
    if (!app) {
      throw new NotFoundError('App')
    }
    return this.toResponse(app)
  }

  async create(data: CreateAppRequest, organizationId: number, userId?: number, ip?: string): Promise<AppResponse> {
    if (!data.name) {
      throw new ValidationError('Nome é obrigatório')
    }
    const maxOrder = await appRepository.getMaxSortOrder(organizationId)

    const app = await withTx(async (tx) => {
      const created = await tx.app.create({
        data: { ...this.toDb(data) as any, organizationId, sortOrder: maxOrder + 1 },
      })
      await this.audit.log(userId, 'CREATE_APP', 'App', created.id, { name: created.name }, ip, tx, organizationId)
      return created
    })

    this.logger.info({ appId: app.id, name: app.name }, 'App created')
    return this.toResponse(app)
  }

  async update(id: number, data: UpdateAppRequest, organizationId: number, userId?: number, ip?: string): Promise<AppResponse> {
    const existing = await appRepository.findByIdAndOrganization(id, organizationId)
    if (!existing) {
      throw new NotFoundError('App')
    }

    const app = await withTx(async (tx) => {
      const updated = await tx.app.update({ where: { id }, data: this.toDb(data) as any })
      await this.audit.log(userId, 'UPDATE_APP', 'App', id, { changes: Object.keys(data) }, ip, tx, organizationId)
      return updated
    })

    this.logger.info({ appId: id }, 'App updated')
    return this.toResponse(app)
  }

  async delete(id: number, organizationId: number, userId?: number, ip?: string): Promise<void> {
    const existing = await appRepository.findByIdAndOrganization(id, organizationId)
    if (!existing) {
      throw new NotFoundError('App')
    }

    await withTx(async (tx) => {
      await tx.app.delete({ where: { id } })
      await this.audit.log(userId, 'DELETE_APP', 'App', id, { name: existing.name }, ip, tx, organizationId)
    })

    this.logger.info({ appId: id, name: existing.name }, 'App deleted')
  }

  async togglePin(id: number, organizationId: number, userId?: number, ip?: string): Promise<AppResponse> {
    const app = await appRepository.findByIdAndOrganization(id, organizationId)
    if (!app) {
      throw new NotFoundError('App')
    }

    if (!app.pinned) {
      const pinnedCount = await appRepository.countPinned(organizationId)
      if (pinnedCount >= 3) {
        throw new ValidationError('Máximo de 3 apps fixados')
      }
    }

    const updated = await withTx(async (tx) => {
      const result = await tx.app.update({ where: { id }, data: { pinned: !app.pinned } })
      await this.audit.log(userId, 'TOGGLE_PIN_APP', 'App', id, { pinned: !app.pinned }, ip, tx, organizationId)
      return result
    })

    return this.toResponse(updated)
  }

  async move(id: number, direction: 1 | -1, organizationId: number, userId?: number, ip?: string): Promise<AppResponse[]> {
    const app = await appRepository.findByIdAndOrganization(id, organizationId)
    if (!app) {
      throw new NotFoundError('App')
    }

    const unpinned = await appRepository.findMany({
      where: { pinned: false, organizationId },
      orderBy: { sortOrder: 'asc' },
    })

    const idx = unpinned.findIndex((a) => a.id === id)
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
      await this.audit.log(userId, 'MOVE_APP', 'App', id, { direction }, ip, tx, organizationId)
    })

    return this.list(organizationId)
  }

  async bulkReplace(apps: CreateAppRequest[], organizationId: number, userId?: number, ip?: string): Promise<AppResponse[]> {
    const dbApps = apps.map((app, index) => ({
      ...this.toDb(app) as any,
      sortOrder: index,
    }))

    const result = await withTx(async (tx) => {
      await tx.app.deleteMany({ where: { organizationId } })
      for (const data of dbApps) {
        await tx.app.create({ data: { ...data, organizationId } })
      }
      await this.audit.log(userId, 'BULK_REPLACE_APPS', 'App', null, { count: apps.length }, ip, tx, organizationId)
      return tx.app.findMany({
        where: { organizationId },
        orderBy: [{ pinned: 'desc' }, { sortOrder: 'asc' }],
      })
    })

    this.logger.info({ count: apps.length }, 'Apps bulk replaced')
    return result.map((app) => this.toResponse(app))
  }
}
