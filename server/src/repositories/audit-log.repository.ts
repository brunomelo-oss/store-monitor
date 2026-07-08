import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

type AuditLogModel = Prisma.AuditLogGetPayload<{}>
type AuditLogCreateInput = Prisma.AuditLogCreateInput
type AuditLogUpdateInput = Prisma.AuditLogUpdateInput

export class AuditLogRepository extends BaseRepository<AuditLogModel, AuditLogCreateInput, AuditLogUpdateInput> {
  protected get model() {
    return this.prisma.auditLog
  }

  async findByUserId(userId: number, take: number = 50): Promise<AuditLogModel[]> {
    return this.model.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    }) as Promise<AuditLogModel[]>
  }

  async findByEntity(entity: string, entityId: number, take: number = 50): Promise<AuditLogModel[]> {
    return this.model.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
      take,
    }) as Promise<AuditLogModel[]>
  }

  async findRecent(take: number = 50): Promise<AuditLogModel[]> {
    return this.model.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: { user: { select: { username: true, email: true } } },
    }) as Promise<AuditLogModel[]>
  }
}
