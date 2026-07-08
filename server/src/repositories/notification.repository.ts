import { Prisma, NotificationType } from '@prisma/client'
import { BaseRepository } from './base.repository'

type NotificationModel = Prisma.NotificationGetPayload<{}>
type NotificationCreateInput = Prisma.NotificationCreateInput
type NotificationUpdateInput = Prisma.NotificationUpdateInput

export class NotificationRepository extends BaseRepository<NotificationModel, NotificationCreateInput, NotificationUpdateInput> {
  protected get model() {
    return this.prisma.notification
  }

  async findByUserId(userId: number, skip: number = 0, take: number = 20): Promise<NotificationModel[]> {
    return this.model.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }) as Promise<NotificationModel[]>
  }

  async countUnread(userId: number): Promise<number> {
    return this.model.count({ where: { userId, read: false } })
  }

  async markAsRead(id: number): Promise<NotificationModel> {
    return this.model.update({ where: { id }, data: { read: true } }) as Promise<NotificationModel>
  }

  async markAllAsRead(userId: number): Promise<number> {
    const result = await this.model.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
    return result.count
  }

  async createForAllUsers(organizationId: number, type: NotificationType, title: string, message: string, appId?: number): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      select: { id: true },
    })
    const notifications = users.map((user) => ({
      userId: user.id,
      organizationId,
      appId: appId || null,
      type,
      title,
      message,
    }))
    await this.model.createMany({ data: notifications })
  }
}
