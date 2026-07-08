import { JobType, SyncTriggerType } from '@prisma/client'

export interface JobPayload {
  type: JobType
  organizationId: number
  payload?: Record<string, unknown>
  scheduledAt?: Date
  maxRetries?: number
  triggerType?: SyncTriggerType
}

export interface JobDispatcher {
  readonly name: string
  enqueue(data: JobPayload): Promise<void>
  start(): void
  stop(): void
}
