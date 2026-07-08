import { Request, Response } from 'express'
import { userService } from '../services'
import { createUserSchema, updateUserRoleSchema, updateUserPasswordSchema } from '../validators'
import { ok, created } from '../lib/response'

export class UserController {
  async list(_req: Request, res: Response) {
    const users = await userService.list()
    ok(res, users)
  }

  async create(req: Request, res: Response) {
    const data = createUserSchema.parse(req.body)
    const user = await userService.create(data, req.user?.userId, req.ip)
    created(res, user)
  }

  async updateRole(req: Request, res: Response) {
    const id = Number(req.params.id)
    const { role } = updateUserRoleSchema.parse(req.body)
    const user = await userService.updateRole(id, role, req.user?.userId, req.ip)
    ok(res, user)
  }

  async updatePassword(req: Request, res: Response) {
    const id = Number(req.params.id)
    const { password } = updateUserPasswordSchema.parse(req.body)
    await userService.updatePassword(id, password, req.user?.userId, req.ip)
    ok(res, { ok: true })
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id)
    await userService.delete(id, req.user?.userId, req.ip)
    ok(res, { ok: true })
  }
}
