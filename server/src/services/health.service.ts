import { prisma } from '../lib/prisma'
import { syncHistoryRepository, jobRepository } from '../repositories'
import { config } from '../config'
import { getLogger } from '../lib/logger'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: ComponentHealth
    api: ComponentHealth
    sync: ComponentHealth
    notifications: ComponentHealth
    analytics: ComponentHealth
    backgroundJobs: ComponentHealth
    providers: {
      google: ComponentHealth
      apple: ComponentHealth
    }
  }
  metrics: {
    syncLatency: MetricValue | null
    averageJobDuration: MetricValue | null
    failedJobs24h: number
    pendingJobs: number
    totalSyncs24h: number
    failedSyncs24h: number
  }
}

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  latency?: number
}

interface MetricValue {
  value: number
  unit: string
}

export class HealthService {
  private logger = getLogger()
  private startTime = Date.now()

  async check(): Promise<HealthStatus> {
    const dbHealth = await this.checkDatabase()
    const syncLatency = await this.getSyncLatency()
    const avgJobDuration = await this.getAverageJobDuration()
    const failedJobs24h = await this.countFailedJobs24h()
    const pendingJobs = await this.countPendingJobs()
    const totalSyncs24h = await this.countSyncs24h()
    const failedSyncs24h = await this.countFailedSyncs24h()

    const overallStatus: HealthStatus['status'] = dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy'

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.nodeEnv,
      checks: {
        database: dbHealth,
        api: { status: 'healthy' },
        sync: { status: config.features.sync ? 'healthy' : 'degraded', message: config.features.sync ? undefined : 'Sync feature disabled' },
        notifications: { status: config.features.notifications ? 'healthy' : 'degraded', message: config.features.notifications ? undefined : 'Notifications disabled' },
        analytics: { status: config.features.analytics ? 'healthy' : 'degraded', message: config.features.analytics ? undefined : 'Analytics disabled' },
        backgroundJobs: { status: config.features.backgroundJobs ? 'healthy' : 'degraded', message: 'Background jobs disabled' },
        providers: {
          google: { status: 'healthy' },
          apple: { status: 'healthy' },
        },
      },
      metrics: {
        syncLatency,
        averageJobDuration: avgJobDuration,
        failedJobs24h,
        pendingJobs,
        totalSyncs24h,
        failedSyncs24h,
      },
    }
  }

  private async checkDatabase(): Promise<ComponentHealth> {
    const start = Date.now()
    try {
      await prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', latency: Date.now() - start }
    } catch (err) {
      this.logger.error({ err }, 'Database health check failed')
      return { status: 'unhealthy', message: 'Database unreachable', latency: Date.now() - start }
    }
  }

  private async getSyncLatency(): Promise<MetricValue | null> {
    const recent = await syncHistoryRepository.findMany({
      where: { status: 'SUCCESS' },
      orderBy: { completedAt: 'desc' },
      take: 1,
    })
    if (!recent.length || !recent[0].completedAt || !recent[0].startedAt) return null
    const latency = new Date(recent[0].completedAt).getTime() - new Date(recent[0].startedAt).getTime()
    return { value: Math.round(latency), unit: 'ms' }
  }

  private async getAverageJobDuration(): Promise<MetricValue | null> {
    const recent = await jobRepository.findMany({
      where: { status: 'SUCCESS', duration: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    if (!recent.length) return null
    const durations = recent.map((j: any) => j.duration).filter(Boolean)
    if (!durations.length) return null
    const avg = durations.reduce((a: number, b: number) => a + b, 0) / durations.length
    return { value: Math.round(avg), unit: 'ms' }
  }

  private async countFailedJobs24h(): Promise<number> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return jobRepository.count({ status: 'FAILED', createdAt: { gte: since } } as any)
  }

  private async countPendingJobs(): Promise<number> {
    return jobRepository.count({ status: 'PENDING' } as any)
  }

  private async countSyncs24h(): Promise<number> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return syncHistoryRepository.count({ startedAt: { gte: since } } as any)
  }

  private async countFailedSyncs24h(): Promise<number> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return syncHistoryRepository.count({ status: 'FAILED', startedAt: { gte: since } } as any)
  }
}
