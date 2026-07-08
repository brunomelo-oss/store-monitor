import { StoreType } from '@prisma/client'
import { storeConnectionRepository, connectionConfigRepository } from '../repositories'
import { encrypt } from '../lib/encryption'
import { getLogger } from '../lib/logger'
import { AuditService } from './audit.service'
import { withTx } from '../lib/prisma'
import { ProviderRegistry } from '../providers'
import { NotFoundError, ConflictError } from '../lib/errors'
import { StoreConnectionResponse, ConnectionTestResult } from '../types'

export class StoreConnectionService {
  private logger = getLogger()
  private audit: AuditService

  constructor() {
    this.audit = new AuditService()
  }

  private toResponse(connection: any): StoreConnectionResponse {
    return {
      id: connection.id,
      store: connection.store as StoreType,
      label: connection.label,
      isActive: connection.isActive,
      lastSyncAt: connection.lastSyncAt?.toISOString?.() || connection.lastSyncAt || null,
    }
  }

  async list(organizationId: number): Promise<StoreConnectionResponse[]> {
    const connections = await storeConnectionRepository.findByOrganization(organizationId)
    return connections.map(this.toResponse)
  }

  async getById(organizationId: number, id: number): Promise<StoreConnectionResponse> {
    const connection = await storeConnectionRepository.findByIdAndOrganization(id, organizationId)
    if (!connection) {
      throw new NotFoundError('StoreConnection')
    }
    return this.toResponse(connection)
  }

  async create(
    organizationId: number,
    data: { store: StoreType; label: string; credentials: Record<string, unknown> },
    userId?: number,
    ip?: string,
  ): Promise<StoreConnectionResponse> {
    const existing = await storeConnectionRepository.findByOrganization(organizationId)
    const duplicate = existing.find((c) => c.store === data.store && c.label === data.label)
    if (duplicate) {
      throw new ConflictError('Já existe uma conexão com este nome para esta loja')
    }

    const credentialsJson = JSON.stringify(data.credentials)
    const encrypted = encrypt(credentialsJson)

    const connection = await withTx(async (tx) => {
      const conn = await tx.storeConnection.create({
        data: {
          organizationId,
          store: data.store,
          label: data.label,
        },
      })

      await tx.connectionConfig.create({
        data: {
          storeConnectionId: conn.id,
          encryptedData: encrypted.encryptedData,
          iv: encrypted.iv,
          tag: encrypted.tag,
          keyVersion: encrypted.keyVersion,
        },
      })

      await tx.auditLog.create({
        data: {
          organizationId,
          userId,
          action: 'CREATE_STORE_CONNECTION',
          entity: 'StoreConnection',
          entityId: conn.id,
          metadata: { store: data.store, label: data.label },
          ip,
        } as any,
      })

      return conn
    })

    this.logger.info({ connectionId: connection.id, store: data.store }, 'Store connection created')
    return this.toResponse(connection)
  }

  async update(
    organizationId: number,
    id: number,
    data: { label?: string; credentials?: Record<string, unknown> },
    userId?: number,
    ip?: string,
  ): Promise<StoreConnectionResponse> {
    const connection = await storeConnectionRepository.findByIdAndOrganization(id, organizationId)
    if (!connection) {
      throw new NotFoundError('StoreConnection')
    }

    const updated = await withTx(async (tx) => {
      const updateData: Record<string, unknown> = {}
      if (data.label) updateData.label = data.label

      const conn = await tx.storeConnection.update({
        where: { id },
        data: updateData,
      })

      if (data.credentials) {
        const credentialsJson = JSON.stringify(data.credentials)
        const encrypted = encrypt(credentialsJson)

        await tx.connectionConfig.upsert({
          where: { storeConnectionId: id },
          create: {
            storeConnectionId: id,
            encryptedData: encrypted.encryptedData,
            iv: encrypted.iv,
            tag: encrypted.tag,
            keyVersion: encrypted.keyVersion,
          },
          update: {
            encryptedData: encrypted.encryptedData,
            iv: encrypted.iv,
            tag: encrypted.tag,
            keyVersion: encrypted.keyVersion,
          },
        })
      }

      await tx.auditLog.create({
        data: {
          organizationId,
          userId,
          action: 'UPDATE_STORE_CONNECTION',
          entity: 'StoreConnection',
          entityId: id,
          metadata: { changes: Object.keys(updateData) },
          ip,
        } as any,
      })

      return conn
    })

    this.logger.info({ connectionId: id }, 'Store connection updated')
    return this.toResponse(updated)
  }

  async delete(organizationId: number, id: number, userId?: number, ip?: string): Promise<void> {
    const connection = await storeConnectionRepository.findByIdAndOrganization(id, organizationId)
    if (!connection) {
      throw new NotFoundError('StoreConnection')
    }

    const appsUsingConnection = await (await import('../repositories')).appRepository.findMany({
      where: { storeConnectionId: id },
    })

    if (appsUsingConnection.length > 0) {
      throw new ConflictError(
        `Esta conexão está vinculada a ${appsUsingConnection.length} app(s). Remova o vínculo antes de excluir.`,
      )
    }

    await withTx(async (tx) => {
      await tx.connectionConfig.delete({ where: { storeConnectionId: id } })
      await tx.storeConnection.delete({ where: { id } })
      await tx.auditLog.create({
        data: {
          organizationId,
          userId,
          action: 'DELETE_STORE_CONNECTION',
          entity: 'StoreConnection',
          entityId: id,
          metadata: { store: connection.store, label: connection.label },
          ip,
        } as any,
      })
    })

    this.logger.info({ connectionId: id }, 'Store connection deleted')
  }

  async test(organizationId: number, id: number): Promise<ConnectionTestResult> {
    const connection = await storeConnectionRepository.findByIdAndOrganization(id, organizationId)
    if (!connection) {
      throw new NotFoundError('StoreConnection')
    }

    const config = await connectionConfigRepository.getDecryptedConfig(id)

    const provider = ProviderRegistry.getInstance().resolve(connection.store)
    await provider.initialize(config)
    const result = await provider.validateConnection()

    return {
      valid: result.valid,
      message: result.message,
      store: connection.store,
      label: connection.label,
    }
  }
}
