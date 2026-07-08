import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

type AppModel = Prisma.AppGetPayload<{}>
type AppCreateInput = Prisma.AppCreateInput
type AppUpdateInput = Prisma.AppUpdateInput

export class AppRepository extends BaseRepository<AppModel, AppCreateInput, AppUpdateInput> {
  protected get model() {
    return this.prisma.app
  }

  async findAllOrdered(): Promise<AppModel[]> {
    return this.model.findMany({
      orderBy: [{ pinned: 'desc' }, { sortOrder: 'asc' }],
      include: {
        syncHistory: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
    })
  }

  async findPinned(): Promise<AppModel[]> {
    return this.model.findMany({
      where: { pinned: true },
      orderBy: { sortOrder: 'asc' },
    })
  }

  async countPinned(): Promise<number> {
    return this.model.count({ where: { pinned: true } })
  }

  async getMaxSortOrder(): Promise<number> {
    const result = await this.model.aggregate({ _max: { sortOrder: true } })
    return result._max.sortOrder || 0
  }

  async swapSortOrder(id1: number, id2: number): Promise<void> {
    const app1 = await this.findById(id1)
    const app2 = await this.findById(id2)
    if (!app1 || !app2) return

    await this.prisma.$transaction([
      this.model.update({ where: { id: id1 }, data: { sortOrder: app2.sortOrder } }),
      this.model.update({ where: { id: id2 }, data: { sortOrder: app1.sortOrder } }),
    ])
  }

  async bulkReplace(apps: AppCreateInput[]): Promise<AppModel[]> {
    await this.prisma.$transaction([
      this.model.deleteMany(),
      ...apps.map((app) => this.model.create({ data: app })),
    ])
    return this.findAllOrdered()
  }

  async findById(id: number): Promise<AppModel | null> {
    return this.model.findUnique({
      where: { id } as any,
      include: {
        syncHistory: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
    }) as Promise<AppModel | null>
  }

  async findWithRelations(id: number): Promise<AppModel | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { createdAt: 'desc' }, take: 10 },
        builds: { orderBy: { createdAt: 'desc' }, take: 10 },
        tracks: true,
        publications: { orderBy: { createdAt: 'desc' }, take: 10 },
        analytics: { orderBy: { date: 'desc' }, take: 30 },
        ratings: { orderBy: { date: 'desc' }, take: 10 },
        reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
        rejections: { orderBy: { createdAt: 'desc' }, take: 10 },
        storeConnection: true,
      },
    }) as Promise<AppModel | null>
  }
}
