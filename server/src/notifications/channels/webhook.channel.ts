import { getLogger } from '../../lib/logger'
import { NotificationChannel, NotificationPayload } from './channel.interface'

export class WebhookChannel implements NotificationChannel {
  readonly name = 'webhook'
  private logger = getLogger()

  isAvailable(): boolean {
    return false
  }

  async send(_payload: NotificationPayload): Promise<void> {
    this.logger.warn('Webhook channel not implemented — notification not sent')
  }
}
