import { Request, Response } from 'express'
import { activityService } from '../services'
import { ok } from '../lib/response'

export class ActivityController {
  async list(req: Request, res: Response) {
    const organizationId = req.user!.organizationId
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const offset = Number(req.query.offset) || 0
    const items = await activityService.list(organizationId, limit, offset)
    ok(res, items)
  }
}
