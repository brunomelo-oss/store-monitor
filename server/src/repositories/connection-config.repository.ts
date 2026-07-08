import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'
import { EncryptedData, decrypt } from '../lib/encryption'

type ConnectionConfigModel = Prisma.ConnectionConfigGetPayload<{}>
type ConnectionConfigCreateInput = Prisma.ConnectionConfigCreateInput
type ConnectionConfigUpdateInput = Prisma.ConnectionConfigUpdateInput

export class ConnectionConfigRepository extends BaseRepository<ConnectionConfigModel, ConnectionConfigCreateInput, ConnectionConfigUpdateInput> {
  protected get model() {
    return this.prisma.connectionConfig
  }

  async findByStoreConnection(storeConnectionId: number): Promise<ConnectionConfigModel | null> {
    return this.model.findUnique({
      where: { storeConnectionId },
    }) as Promise<ConnectionConfigModel | null>
  }

  async getDecryptedConfig(storeConnectionId: number): Promise<Record<string, unknown>> {
    const config = await this.findByStoreConnection(storeConnectionId)
    if (!config) {
      throw new Error('Connection config not found')
    }

    const encrypted: EncryptedData = {
      encryptedData: config.encryptedData,
      iv: config.iv,
      tag: config.tag,
      keyVersion: config.keyVersion,
    }

    const decrypted = decrypt(encrypted)
    return JSON.parse(decrypted) as Record<string, unknown>
  }
}
