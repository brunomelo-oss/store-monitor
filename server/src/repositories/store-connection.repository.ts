import { Prisma, StoreType } from '@prisma/client'
import { BaseRepository } from './base.repository'

type StoreConnectionModel = Prisma.StoreConnectionGetPayload<{}>
type StoreConnectionCreateInput = Prisma.StoreConnectionCreateInput
type StoreConnectionUpdateInput = Prisma.StoreConnectionUpdateInput

export class StoreConnectionRepository extends BaseRepository<StoreConnectionModel, StoreConnectionCreateInput, StoreConnectionUpdateInput> {
  protected get model() {
    return this.prisma.storeConnection
  }

  async findByOrganization(organizationId: number): Promise<StoreConnectionModel[]> {
    return this.model.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<StoreConnectionModel[]>
  }

  async findByIdAndOrganization(id: number, organizationId: number): Promise<StoreConnectionModel | null> {
    return this.model.findFirst({
      where: { id, organizationId },
    }) as Promise<StoreConnectionModel | null>
  }

  async findByStoreAndOrganization(organizationId: number, store: StoreType): Promise<StoreConnectionModel[]> {
    return this.model.findMany({
      where: { organizationId, store },
      orderBy: { createdAt: 'desc' },
    }) as Promise<StoreConnectionModel[]>
  }

  async updateLastSync(id: number): Promise<StoreConnectionModel> {
    return this.model.update({
      where: { id },
      data: { lastSyncAt: new Date() },
    }) as Promise<StoreConnectionModel>
  }
}
