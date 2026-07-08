import { Request, Response } from 'express'
import { inviteService } from '../services'
import { createInviteSchema } from '../validators'
import { ok, created } from '../lib/response'

export class InviteController {
  async list(_req: Request, res: Response) {
    const invites = await inviteService.list()
    ok(res, invites)
  }

  async create(req: Request, res: Response) {
    const data = createInviteSchema.parse(req.body)
    const invite = await inviteService.create(data, 1, req.user?.userId, req.ip)
    created(res, invite)
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id)
    await inviteService.delete(id, req.user?.userId, req.ip)
    ok(res, { ok: true })
  }

  async check(req: Request, res: Response) {
    const email = req.params.email
    const active = await inviteService.check(email)
    ok(res, { active })
  }
}
