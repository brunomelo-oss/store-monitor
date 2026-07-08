import { Prisma, StoreType } from '@prisma/client'
import { BaseRepository } from './base.repository'

type ReleaseModel = Prisma.ReleaseGetPayload<{}>
type ReleaseCreateInput = Prisma.ReleaseCreateInput
type ReleaseUpdateInput = Prisma.ReleaseUpdateInput

export class ReleaseRepository extends BaseRepository<ReleaseModel, ReleaseCreateInput, ReleaseUpdateInput> {
  protected get model() {
    return this.prisma.release
  }

  async findByApp(appId: number, store?: StoreType): Promise<ReleaseModel[]> {
    const where: Record<string, unknown> = { appId }
    if (store) where.store = store
    return this.model.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }) as Promise<ReleaseModel[]>
  }

  async findLatestByApp(appId: number, store: StoreType): Promise<ReleaseModel | null> {
    return this.model.findFirst({
      where: { appId, store },
      orderBy: { createdAt: 'desc' },
    }) as Promise<ReleaseModel | null>
  }
}
