import { notificationRepository } from '../../repositories'
import { getLogger } from '../../lib/logger'
import { NotificationChannel, NotificationPayload } from './channel.interface'

export class InAppChannel implements NotificationChannel {
  readonly name = 'in-app'
  private logger = getLogger()

  isAvailable(): boolean {
    return true
  }

  async send(payload: NotificationPayload): Promise<void> {
    if (payload.userId) {
      await notificationRepository.create({
        userId: payload.userId,
        organizationId: payload.organizationId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        appId: payload.appId || null,
      } as any)
    } else {
      await notificationRepository.createForAllUsers(
        payload.organizationId,
        payload.type,
        payload.title,
        payload.message,
        payload.appId,
      )
    }
    this.logger.debug({ channel: 'in-app', type: payload.type }, 'In-app notification sent')
  }
}
