import { Request, Response } from 'express'
import { syncEngineService, jobService } from '../services'
import { ok, created, noContent, fail } from '../lib/response'
import { jobRepository } from '../repositories'
import { triggerSyncSchema } from '../validators'

export class SyncController {
  async trigger(req: Request, res: Response) {
    const data = triggerSyncSchema.parse(req.body)
    const organizationId = req.user?.organizationId ?? 1

    const result = await syncEngineService.executeSync({
      appId: data.appId,
      store: data.store,
      types: data.types,
      organizationId,
    })

    ok(res, result)
  }

  async listJobs(req: Request, res: Response) {
    const organizationId = req.user?.organizationId ?? 1
    const jobs = await jobRepository.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    ok(res, jobs)
  }

  async getJob(req: Request, res: Response) {
    const job = await jobService.getById(Number(req.params.id))
    ok(res, job)
  }

  async retryJob(req: Request, res: Response) {
    const jobId = Number(req.params.id)
    const organizationId = req.user?.organizationId ?? 1

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
    const jobId = Number(req.params.id)
    await jobService.markIgnored(jobId)
    ok(res, { ok: true })
  }

  async deleteJob(req: Request, res: Response) {
    const jobId = Number(req.params.id)
    const organizationId = req.user?.organizationId ?? 1

    const existing = await jobRepository.findById(jobId)
    if (!existing || existing.organizationId !== organizationId) {
      return fail(res, 404, 'NOT_FOUND', 'Job não encontrado')
    }

    await jobRepository.delete(jobId)
    noContent(res)
  }

  async listHistory(req: Request, res: Response) {
    const organizationId = req.user?.organizationId ?? 1
    const history = await (await import('../repositories')).syncHistoryRepository.findMany({
      where: { organizationId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    })
    ok(res, history)
  }

  async getHistory(req: Request, res: Response) {
    const history = await (await import('../repositories')).syncHistoryRepository.findById(Number(req.params.id))
    if (!history) {
      return fail(res, 404, 'NOT_FOUND', 'Histórico não encontrado')
    }
    ok(res, history)
  }
}
