import { Request, Response } from 'express'
import { notificationService } from '../services'
import { ok } from '../lib/response'

export class NotificationsController {
  async list(req: Request, res: Response) {
    const userId = req.user!.userId
    const skip = Number(req.query.skip) || 0
    const take = Math.min(Number(req.query.take) || 20, 100)
    const notifications = await notificationService.list(userId, skip, take)
    ok(res, notifications)
  }

  async countUnread(req: Request, res: Response) {
    const userId = req.user!.userId
    const count = await notificationService.countUnread(userId)
    ok(res, { count })
  }

  async markAsRead(req: Request, res: Response) {
    const userId = req.user!.userId
    const id = Number(req.params.id)
    const notification = await notificationService.markAsRead(id, userId)
    ok(res, notification)
  }

  async markAllAsRead(req: Request, res: Response) {
    const userId = req.user!.userId
    const count = await notificationService.markAllAsRead(userId)
    ok(res, { count })
  }
}
