import { Prisma, JobStatus, JobType } from '@prisma/client'
import { BaseRepository } from './base.repository'

type JobModel = Prisma.JobGetPayload<{}>
type JobCreateInput = Prisma.JobCreateInput
type JobUpdateInput = Prisma.JobUpdateInput

export class JobRepository extends BaseRepository<JobModel, JobCreateInput, JobUpdateInput> {
  protected get model() {
    return this.prisma.job
  }

  async findPending(take: number = 10): Promise<JobModel[]> {
    return this.model.findMany({
      where: { status: JobStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      take,
    }) as Promise<JobModel[]>
  }

  async findScheduled(): Promise<JobModel[]> {
    return this.model.findMany({
      where: {
        status: JobStatus.PENDING,
        scheduledAt: { lte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
    }) as Promise<JobModel[]>
  }

  async findByType(type: JobType, take: number = 20): Promise<JobModel[]> {
    return this.model.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
      take,
    }) as Promise<JobModel[]>
  }

  async markStarted(id: number): Promise<JobModel> {
    return this.model.update({
      where: { id },
      data: { status: JobStatus.RUNNING, startedAt: new Date() },
    }) as Promise<JobModel>
  }

  async markCompleted(id: number, result?: Prisma.InputJsonValue): Promise<JobModel> {
    return this.model.update({
      where: { id },
      data: { status: JobStatus.SUCCESS, result: result ?? Prisma.DbNull, completedAt: new Date() },
    }) as Promise<JobModel>
  }

  async markFailed(id: number, error: string): Promise<JobModel> {
    return this.model.update({
      where: { id },
      data: { status: JobStatus.FAILED, lastError: error, completedAt: new Date() },
    }) as Promise<JobModel>
  }

  async markIgnored(id: number): Promise<JobModel> {
    return this.model.update({
      where: { id },
      data: { status: JobStatus.IGNORED, completedAt: new Date() },
    }) as Promise<JobModel>
  }

  async cancelPendingByType(type: JobType): Promise<number> {
    const result = await this.model.updateMany({
      where: { type, status: JobStatus.PENDING },
      data: { status: JobStatus.IGNORED, completedAt: new Date() },
    })
    return result.count
  }
}
