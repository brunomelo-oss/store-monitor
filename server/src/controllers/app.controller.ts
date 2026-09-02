import { Request, Response } from 'express'
import { appService } from '../services'
import { createAppSchema, updateAppSchema, moveAppSchema, bulkReplaceSchema } from '../validators'
import { ok, created } from '../lib/response'
import { currentOrganizationId } from '../middleware/auth'

export class AppController {
  async list(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const apps = await appService.list(organizationId)
    ok(res, apps)
  }

  async getById(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const id = Number(req.params.id)
    const app = await appService.getById(id, organizationId)
    ok(res, app)
  }

  async create(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const data = createAppSchema.parse(req.body)
    const app = await appService.create(data, organizationId, req.user?.userId, req.ip)
    created(res, app)
  }

  async update(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const id = Number(req.params.id)
    const data = updateAppSchema.parse(req.body)
    const app = await appService.update(id, data, organizationId, req.user?.userId, req.ip)
    ok(res, app)
  }

  async delete(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const id = Number(req.params.id)
    await appService.delete(id, organizationId, req.user?.userId, req.ip)
    ok(res, { ok: true })
  }

  async togglePin(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const id = Number(req.params.id)
    const app = await appService.togglePin(id, organizationId, req.user?.userId, req.ip)
    ok(res, app)
  }

  async move(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const id = Number(req.params.id)
    const { direction } = moveAppSchema.parse(req.body)
    const apps = await appService.move(id, direction, organizationId, req.user?.userId, req.ip)
    ok(res, apps)
  }

  async bulkReplace(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const { apps } = bulkReplaceSchema.parse(req.body)
    const result = await appService.bulkReplace(apps, organizationId, req.user?.userId, req.ip)
    ok(res, result)
  }
}
