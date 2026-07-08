import { Prisma, SyncType, SyncStatus } from '@prisma/client'
import { BaseRepository } from './base.repository'

type SyncHistoryModel = Prisma.SyncHistoryGetPayload<{}>
type SyncHistoryCreateInput = Prisma.SyncHistoryCreateInput
type SyncHistoryUpdateInput = Prisma.SyncHistoryUpdateInput

export class SyncHistoryRepository extends BaseRepository<SyncHistoryModel, SyncHistoryCreateInput, SyncHistoryUpdateInput> {
  protected get model() {
    return this.prisma.syncHistory
  }

  async findRecentByAppAndType(appId: number, type: SyncType, take: number = 10): Promise<SyncHistoryModel[]> {
    return this.model.findMany({
      where: { appId, type },
      orderBy: { startedAt: 'desc' },
      take,
    }) as Promise<SyncHistoryModel[]>
  }

  async findFailed(): Promise<SyncHistoryModel[]> {
    return this.model.findMany({
      where: { status: SyncStatus.FAILED },
      orderBy: { startedAt: 'desc' },
      take: 50,
    }) as Promise<SyncHistoryModel[]>
  }

  async findLastSyncByType(type: SyncType): Promise<SyncHistoryModel | null> {
    return this.model.findFirst({
      where: { type, status: SyncStatus.SUCCESS },
      orderBy: { startedAt: 'desc' },
    }) as Promise<SyncHistoryModel | null>
  }
}
