import { Request, Response } from 'express'
import { userService } from '../services'
import { updateUserRoleSchema, updateUserPasswordSchema } from '../validators'
import { ok, created } from '../lib/response'
import { currentOrganizationId } from '../middleware/auth'

export class UserController {
  async list(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const users = await userService.list(organizationId)
    ok(res, users)
  }

  async updateRole(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const id = Number(req.params.id)
    const { role } = updateUserRoleSchema.parse(req.body)
    const user = await userService.updateRole(id, role, organizationId, req.user?.userId, req.ip)
    ok(res, user)
  }

  async updatePassword(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const id = Number(req.params.id)
    const { password } = updateUserPasswordSchema.parse(req.body)
    await userService.updatePassword(id, password, organizationId, req.user?.userId, req.ip)
    ok(res, { ok: true })
  }

  async delete(req: Request, res: Response) {
    const organizationId = currentOrganizationId(req)
    const id = Number(req.params.id)
    await userService.delete(id, organizationId, req.user?.userId, req.ip)
    ok(res, { ok: true })
  }
}
