import { Prisma } from '@prisma/client'
import { auditLogRepository } from '../repositories'
import { getLogger } from '../lib/logger'

type TxClient = Prisma.TransactionClient

export class AuditService {
  private logger = getLogger()

  async log(
    userId: number | null,
    action: string,
    entity: string,
    entityId: number | null,
    metadata?: Record<string, unknown>,
    ip?: string,
    tx?: TxClient,
    organizationId: number = 1,
  ): Promise<void> {
    try {
      const data = {
        userId,
        organizationId,
        action,
        entity,
        entityId,
        metadata: metadata || {},
        ip,
      } as any

      if (tx) {
        await tx.auditLog.create({ data })
      } else {
        await auditLogRepository.create(data)
      }
      this.logger.debug({ userId, action, entity, entityId }, 'Audit log created')
    } catch (error) {
      this.logger.error({ err: error, action, entity }, 'Failed to create audit log')
    }
  }
}
