import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { ok } from '../lib/response'

export class AuditLogController {
  async list(req: Request, res: Response) {
    const organizationId = req.user!.organizationId
    const entity = req.query.entity as string | undefined
    const entityId = req.query.entityId ? Number(req.query.entityId) : undefined
    const action = req.query.action as string | undefined
    const take = Math.min(Number(req.query.take) || 50, 200)
    const skip = Number(req.query.skip) || 0

    const where: Record<string, unknown> = { organizationId }
    if (entity) where.entity = entity
    if (entityId) where.entityId = entityId
    if (action) where.action = action

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: { user: { select: { id: true, username: true, email: true } } },
    })

    ok(res, logs)
  }
}
