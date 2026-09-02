import { Request, Response } from 'express'
import { syncEngineService, jobService } from '../services'
import { ok, created, noContent, fail } from '../lib/response'
import { jobRepository, syncHistoryRepository } from '../repositories'
import { NotFoundError } from '../lib/errors'
import { triggerSyncSchema } from '../validators'
import { currentOrganizationId } from '../middleware/auth'

export class SyncController {
  async trigger(req: Request, res: Response) {
    const data = triggerSyncSchema.parse(req.body)
    const organizationId = currentOrganizationId(req)

    const result = await syncEngineService.executeSync({
      appId: data.appId,
      store: data.store,
      types: data.types,
      organizationId,
    })

    ok(res, result)
  }

  async listJobs(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const jobs = await jobRepository.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    ok(res, jobs)
  }

  async getJob(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const job = await jobService.getById(Number(req.params.id), organizationId)
    ok(res, job)
  }

  async retryJob(req: Request, res: Response) {
    const jobId = Number(req.params.id)
    const organizationId = currentOrganizationId(req)

    const existing = await jobRepository.findById(jobId)
    if (!existing || existing.organizationId !== organizationId) {
      return fail(res, 404, 'NOT_FOUND', 'Job não encontrado')
    }

    await jobRepository.create({
      type: existing.type,
      organizationId,
      status: 'PENDING' as any,
      payload: existing.payload || {},
      maxRetries: existing.maxRetries,
      triggerType: 'RETRY' as any,
    } as any)

    ok(res, { ok: true })
  }

  async ignoreJob(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const jobId = Number(req.params.id)
    const existing = await jobRepository.findById(jobId)
    if (!existing || existing.organizationId !== organizationId) {
      return fail(res, 404, 'NOT_FOUND', 'Job não encontrado')
    }
    await jobService.markIgnored(jobId, organizationId)
    ok(res, { ok: true })
  }

  async deleteJob(req: Request, res: Response) {
    const jobId = Number(req.params.id)
    const organizationId = currentOrganizationId(req)

    const existing = await jobRepository.findById(jobId)
    if (!existing || existing.organizationId !== organizationId) {
      return fail(res, 404, 'NOT_FOUND', 'Job não encontrado')
    }

    await jobRepository.delete(jobId)
    noContent(res)
  }

  async listHistory(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const history = await syncHistoryRepository.findMany({
      where: { organizationId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    })
    ok(res, history)
  }

  async getHistory(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const history = await syncHistoryRepository.findFirst({
      where: { id: Number(req.params.id), organizationId },
    })
    if (!history) {
      throw new NotFoundError('Histórico não encontrado')
    }
    ok(res, history)
  }
}
