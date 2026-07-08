import { Request, Response } from 'express'
import { storeConnectionService } from '../services'
import { ok, created, noContent, fail } from '../lib/response'
import { createStoreConnectionSchema, updateStoreConnectionSchema } from '../validators'

export class StoreConnectionController {
  async list(req: Request, res: Response) {
    const organizationId = req.user?.organizationId ?? 1
    const connections = await storeConnectionService.list(organizationId)
    ok(res, connections)
  }

  async getById(req: Request, res: Response) {
    const organizationId = req.user?.organizationId ?? 1
    const connection = await storeConnectionService.getById(organizationId, Number(req.params.id))
    ok(res, connection)
  }

  async create(req: Request, res: Response) {
    const data = createStoreConnectionSchema.parse(req.body)
    const organizationId = req.user?.organizationId ?? 1
    const connection = await storeConnectionService.create(organizationId, data, req.user?.userId, req.ip)
    created(res, connection)
  }

  async update(req: Request, res: Response) {
    const data = updateStoreConnectionSchema.parse(req.body)
    const organizationId = req.user?.organizationId ?? 1
    const connection = await storeConnectionService.update(organizationId, Number(req.params.id), data, req.user?.userId, req.ip)
    ok(res, connection)
  }

  async delete(req: Request, res: Response) {
    const organizationId = req.user?.organizationId ?? 1
    await storeConnectionService.delete(organizationId, Number(req.params.id), req.user?.userId, req.ip)
    noContent(res)
  }

  async test(req: Request, res: Response) {
    const organizationId = req.user?.organizationId ?? 1
    const result = await storeConnectionService.test(organizationId, Number(req.params.id))
    ok(res, result)
  }
}
