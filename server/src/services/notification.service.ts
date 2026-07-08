import { NotificationType } from '@prisma/client'
import { notificationRepository } from '../repositories'
import { getLogger } from '../lib/logger'
import { NotificationDispatcher } from '../notifications'
import { NotificationResponse } from '../types'

export class NotificationService {
  private logger = getLogger()
  private dispatcher: NotificationDispatcher

  constructor() {
    this.dispatcher = new NotificationDispatcher()
  }

  private toResponse(notification: any): NotificationResponse {
    return {
      id: notification.id,
      type: notification.type as NotificationType,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt?.toISOString?.() || notification.createdAt,
      appId: notification.appId || undefined,
    }
  }

  async list(userId: number, skip: number = 0, take: number = 20): Promise<NotificationResponse[]> {
    const notifications = await notificationRepository.findByUserId(userId, skip, take)
    return notifications.map(this.toResponse)
  }

  async countUnread(userId: number): Promise<number> {
    return notificationRepository.countUnread(userId)
  }

  async markAsRead(id: number, userId: number): Promise<NotificationResponse> {
    const notification = await notificationRepository.findById(id)
    if (!notification || notification.userId !== userId) {
      throw new Error('Notificação não encontrada')
    }
    const updated = await notificationRepository.markAsRead(id)
    return this.toResponse(updated)
  }

  async markAllAsRead(userId: number): Promise<number> {
    return notificationRepository.markAllAsRead(userId)
  }

  async notifyAllUsers(organizationId: number, type: NotificationType, title: string, message: string, appId?: number): Promise<void> {
    await this.dispatcher.dispatch({ organizationId, type, title, message, appId })
    this.logger.info({ type, title, appId }, 'Notification dispatched to all channels')
  }

  async notifyUser(organizationId: number, userId: number, type: NotificationType, title: string, message: string, appId?: number): Promise<void> {
    await this.dispatcher.dispatch({ organizationId, type, title, message, appId, userId })
    this.logger.info({ type, title, appId, userId }, 'Notification dispatched to user')
  }
}
