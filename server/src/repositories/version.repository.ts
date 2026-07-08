import { Prisma, StoreType, VersionStatus } from '@prisma/client'
import { BaseRepository } from './base.repository'

type VersionModel = Prisma.VersionGetPayload<{}>
type VersionCreateInput = Prisma.VersionCreateInput
type VersionUpdateInput = Prisma.VersionUpdateInput

export class VersionRepository extends BaseRepository<VersionModel, VersionCreateInput, VersionUpdateInput> {
  protected get model() {
    return this.prisma.version
  }

  async findByAppAndStore(appId: number, store: StoreType): Promise<VersionModel[]> {
    return this.model.findMany({
      where: { appId, store },
      orderBy: { createdAt: 'desc' },
    }) as Promise<VersionModel[]>
  }

  async findLatestByAppAndStore(appId: number, store: StoreType): Promise<VersionModel | null> {
    return this.model.findFirst({
      where: { appId, store },
      orderBy: { createdAt: 'desc' },
    }) as Promise<VersionModel | null>
  }

  async findPublishedByAppAndStore(appId: number, store: StoreType): Promise<VersionModel[]> {
    return this.model.findMany({
      where: { appId, store, status: VersionStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
    }) as Promise<VersionModel[]>
  }
}
