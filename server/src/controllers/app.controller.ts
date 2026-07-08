import { Request, Response } from 'express'
import { appService } from '../services'
import { createAppSchema, updateAppSchema, moveAppSchema, bulkReplaceSchema } from '../validators'
import { ok, created } from '../lib/response'

export class AppController {
  async list(_req: Request, res: Response) {
    const apps = await appService.list()
    ok(res, apps)
  }

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id)
    const app = await appService.getById(id)
    ok(res, app)
  }

  async create(req: Request, res: Response) {
    const data = createAppSchema.parse(req.body)
    const app = await appService.create(data, req.user?.userId, req.ip)
    created(res, app)
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id)
    const data = updateAppSchema.parse(req.body)
    const app = await appService.update(id, data, req.user?.userId, req.ip)
    ok(res, app)
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id)
    await appService.delete(id, req.user?.userId, req.ip)
    ok(res, { ok: true })
  }

  async togglePin(req: Request, res: Response) {
    const id = Number(req.params.id)
    const app = await appService.togglePin(id, req.user?.userId, req.ip)
    ok(res, app)
  }

  async move(req: Request, res: Response) {
    const id = Number(req.params.id)
    const { direction } = moveAppSchema.parse(req.body)
    const apps = await appService.move(id, direction, req.user?.userId, req.ip)
    ok(res, apps)
  }

  async bulkReplace(req: Request, res: Response) {
    const { apps } = bulkReplaceSchema.parse(req.body)
    const result = await appService.bulkReplace(apps, req.user?.userId, req.ip)
    ok(res, result)
  }
}
