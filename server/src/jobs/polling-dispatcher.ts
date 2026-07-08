import { JobStatus, JobType, SyncTriggerType } from '@prisma/client'
import { jobRepository } from '../repositories'
import { getLogger } from '../lib/logger'
import { JobService } from '../services/job.service'
import { JobDispatcher, JobPayload } from './job-dispatcher'

export class PollingDispatcher implements JobDispatcher {
  readonly name = 'polling'
  private logger = getLogger()
  private interval: NodeJS.Timeout | null = null
  private pollIntervalMs: number
  private jobService: JobService

  constructor(pollIntervalMs: number = 5000) {
    this.pollIntervalMs = pollIntervalMs
    this.jobService = new JobService()
  }

  async enqueue(data: JobPayload): Promise<void> {
    await jobRepository.create({
      type: data.type,
      organizationId: data.organizationId,
      status: JobStatus.PENDING,
      payload: data.payload || {},
      scheduledAt: data.scheduledAt,
      maxRetries: data.maxRetries ?? 3,
      triggerType: data.triggerType ?? SyncTriggerType.MANUAL,
    } as any)

    this.logger.debug({ type: data.type, organizationId: data.organizationId }, 'Job enqueued via polling dispatcher')
  }

  start(): void {
    if (this.interval) return

    this.logger.info({ pollIntervalMs: this.pollIntervalMs }, 'Polling dispatcher started')
    this.interval = setInterval(() => this.poll(), this.pollIntervalMs)
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      this.logger.info('Polling dispatcher stopped')
    }
  }

  private async poll(): Promise<void> {
    try {
      const result = await this.jobService.processNext()
      if (result) {
        this.logger.debug({ jobId: result.id, type: result.type }, 'Job processed by polling dispatcher')
      }
    } catch (error) {
      this.logger.error({ err: error }, 'Polling dispatcher error')
    }
  }
}
