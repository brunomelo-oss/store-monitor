import { prisma } from '../lib/prisma'

interface ActivityItem {
  id: string
  type: 'audit_log' | 'sync' | 'notification' | 'job'
  action: string
  entity: string
  entityId: number | null
  description: string
  metadata: Record<string, unknown> | null
  userId: number | null
  username: string | null
  createdAt: string
}

export class ActivityService {
  async list(organizationId: number, limit: number = 50, offset: number = 0): Promise<ActivityItem[]> {
    const [auditLogs, syncHistory, notifications, jobs] = await Promise.all([
      prisma.auditLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: { user: { select: { username: true } } },
      }),
      prisma.syncHistory.findMany({
        where: { organizationId },
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.job.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ])

    const items: ActivityItem[] = [
      ...auditLogs.map((log) => ({
        id: `audit-${log.id}`,
        type: 'audit_log' as const,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        description: this.describeAuditAction(log.action, log.entity, log.metadata as Record<string, unknown> | null),
        metadata: log.metadata as Record<string, unknown> | null,
        userId: log.userId,
        username: (log as any).user?.username || null,
        createdAt: log.createdAt.toISOString(),
      })),
      ...syncHistory.map((sync) => ({
        id: `sync-${sync.id}`,
        type: 'sync' as const,
        action: `sync.${sync.status.toLowerCase()}`,
        entity: 'sync_history',
        entityId: sync.id,
        description: `Sincronização ${sync.type} — ${sync.status}`,
        metadata: { store: sync.store, triggerType: sync.triggerType, changesDetected: sync.changesDetected } as Record<string, unknown>,
        userId: null,
        username: null,
        createdAt: sync.startedAt?.toISOString() || new Date().toISOString(),
      })),
      ...notifications.map((notif) => ({
        id: `notif-${notif.id}`,
        type: 'notification' as const,
        action: `notification.${notif.type.toLowerCase()}`,
        entity: 'notification',
        entityId: notif.id,
        description: notif.title,
        metadata: { type: notif.type, appId: notif.appId } as Record<string, unknown>,
        userId: notif.userId,
        username: null,
        createdAt: notif.createdAt.toISOString(),
      })),
      ...jobs.map((job) => ({
        id: `job-${job.id}`,
        type: 'job' as const,
        action: `job.${job.status.toLowerCase()}`,
        entity: 'job',
        entityId: job.id,
        description: `Job ${job.type} — ${job.status}`,
        metadata: { triggerType: job.triggerType, retryCount: job.retryCount, lastError: job.lastError } as Record<string, unknown>,
        userId: null,
        username: null,
        createdAt: job.createdAt.toISOString(),
      })),
    ]

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return items.slice(0, limit)
  }

  private describeAuditAction(action: string, entity: string, metadata: Record<string, unknown> | null): string {
    const name = (metadata?.name || metadata?.appName || '') as string
    switch (action) {
      case 'CREATE_APP': return `App criado: ${name}`
      case 'UPDATE_APP': return `App atualizado: ${name}`
      case 'DELETE_APP': return `App excluído: ${name}`
      case 'TOGGLE_PIN_APP': return `App ${name} ${metadata?.pinned ? 'fixado' : 'desfixado'}`
      case 'MOVE_APP': return `App ${name} movido`
      case 'BULK_REPLACE_APPS': return `Apps substituídos em massa`
      case 'INVITE_USER': return `Convite enviado para ${metadata?.email}`
      case 'CREATE_USER': return `Usuário criado: ${metadata?.username}`
      case 'SIGN_IN': return `Login realizado`
      case 'SIGN_OUT': return `Logout realizado`
      case 'CHANGE_PASSWORD': return `Senha alterada`
      case 'JOB_COMPLETED': return `Job concluído: ${metadata?.jobType}`
      case 'JOB_FAILED': return `Job falhou: ${metadata?.jobType}`
      default: return `${action} em ${entity}`
    }
  }
}
