import { JobType, JobStatus, SyncTriggerType, Job } from '@prisma/client'
import { jobRepository } from '../repositories'
import { getLogger } from '../lib/logger'
import { toISO } from '../lib/utils'
import { AuditService } from './audit.service'
import { SyncEngineService } from './sync-engine.service'
import { JobResponse } from '../types'

interface JobPayload {
  type: JobType
  organizationId: number
  triggerType?: SyncTriggerType
  payload?: Record<string, unknown>
  scheduledAt?: Date
}

export class JobService {
  private logger = getLogger()
  private audit: AuditService
  private syncEngine: SyncEngineService

  constructor() {
    this.audit = new AuditService()
    this.syncEngine = new SyncEngineService()
  }

  private toResponse(job: Job): JobResponse {
    return {
      id: job.id,
      type: job.type as JobType,
      status: job.status as JobStatus,
      payload: (job.payload ?? undefined) as Record<string, unknown> | undefined,
      result: (job.result ?? undefined) as Record<string, unknown> | undefined,
      error: job.lastError || undefined,
      retryCount: job.retryCount ?? 0,
      maxRetries: job.maxRetries ?? 3,
      lastError: job.lastError || undefined,
      stack: job.stack || undefined,
      duration: job.duration || undefined,
      lastRetryAt: toISO(job.lastRetryAt) ?? undefined,
      triggerType: job.triggerType as SyncTriggerType,
      scheduledAt: toISO(job.scheduledAt) ?? undefined,
      startedAt: toISO(job.startedAt) ?? undefined,
      completedAt: toISO(job.completedAt) ?? undefined,
      createdAt: toISO(job.createdAt) ?? '',
    }
  }

  async enqueue(data: JobPayload): Promise<JobResponse> {
    if (!data.organizationId) {
      throw new Error('Job sem organização vinculada')
    }
    const job = await jobRepository.create({
      type: data.type,
      status: JobStatus.PENDING,
      payload: data.payload || {},
      scheduledAt: data.scheduledAt,
      organizationId: data.organizationId,
      triggerType: data.triggerType ?? SyncTriggerType.MANUAL,
    } as any)

    this.logger.info({ jobId: job.id, type: data.type }, 'Job enqueued')
    return this.toResponse(job)
  }

  async listPending(): Promise<JobResponse[]> {
    const jobs = await jobRepository.findPending()
    return jobs.map(this.toResponse)
  }

  async listScheduled(): Promise<JobResponse[]> {
    const jobs = await jobRepository.findScheduled()
    return jobs.map(this.toResponse)
  }

  async getById(id: number, organizationId: number): Promise<JobResponse> {
    const job = await jobRepository.findFirst({
      where: { id, organizationId },
    })
    if (!job) {
      throw new Error('Job não encontrado')
    }
    return this.toResponse(job)
  }

  async markIgnored(id: number, organizationId: number): Promise<JobResponse> {
    const job = await jobRepository.findFirst({
      where: { id, organizationId },
    })
    if (!job) {
      throw new Error('Job não encontrado')
    }
    const updated = await jobRepository.markIgnored(id)
    this.logger.info({ jobId: id }, 'Job ignored')
    return this.toResponse(updated)
  }

  async processNext(): Promise<JobResponse | null> {
    const pending = await jobRepository.findPending(1)
    if (pending.length === 0) return null

    const job = await jobRepository.markStarted(pending[0].id)

    try {
      this.logger.info({ jobId: job.id, type: job.type }, 'Processing job')

      switch (job.type) {
        case 'SYNC':
          await this.processSyncJob(job)
          break
        case 'NOTIFICATION':
          await this.processNotificationJob(job)
          break
        case 'ANALYTICS_UPDATE':
          await this.processAnalyticsJob(job)
          break
        case 'RETRY':
          await this.processRetryJob(job)
          break
      }

      const completed = await jobRepository.markCompleted(job.id, { processed: true })
      await this.audit.log(null, 'JOB_COMPLETED', 'Job', job.id, { type: job.type }, undefined, undefined, job.organizationId)
      this.logger.info({ jobId: job.id, type: job.type }, 'Job completed')
      return this.toResponse(completed)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const failed = await jobRepository.markFailed(job.id, message)
      await this.audit.log(null, 'JOB_FAILED', 'Job', job.id, { type: job.type, error: message }, undefined, undefined, job.organizationId)
      this.logger.error({ jobId: job.id, type: job.type, err: error }, 'Job failed')
      return this.toResponse(failed)
    }
  }

  private async processSyncJob(job: any): Promise<void> {
    const payload = (job.payload || {}) as Record<string, unknown>
    if (!job.organizationId) {
      throw new Error('Job sem organização vinculada')
    }
    await this.syncEngine.executeSync({
      appId: payload.appId as number,
      store: payload.store as any,
      types: [payload.type as any],
      organizationId: job.organizationId,
    })
  }

  private async processNotificationJob(_job: any): Promise<void> {
    // TODO: Implement notification dispatch via background job
    this.logger.warn('Notification job processing not implemented')
  }

  private async processAnalyticsJob(_job: any): Promise<void> {
    // TODO: Implement analytics update job
    this.logger.warn('Analytics job processing not implemented')
  }

  private async processRetryJob(job: any): Promise<void> {
    const payload = (job.payload || {}) as Record<string, unknown>
    const originalJobId = payload.originalJobId as number | undefined

    if (!originalJobId) {
      throw new Error('Retry job missing originalJobId in payload')
    }

    const originalJob = await jobRepository.findById(originalJobId)
    if (!originalJob) {
      throw new Error(`Original job ${originalJobId} not found`)
    }

    await jobRepository.create({
      type: originalJob.type,
      status: JobStatus.PENDING,
      payload: originalJob.payload || {},
      organizationId: originalJob.organizationId,
      triggerType: originalJob.triggerType,
    } as any)
  }

  async cleanupOldJobs(daysToKeep: number = 30): Promise<number> {
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
    const oldJobs = await jobRepository.findMany({
      where: {
        status: { in: [JobStatus.SUCCESS, JobStatus.IGNORED] },
        completedAt: { lt: cutoff },
      },
    })

    for (const job of oldJobs) {
      await jobRepository.delete(job.id)
    }

    this.logger.info({ count: oldJobs.length }, 'Old jobs cleaned up')
    return oldJobs.length
  }
}
