import { getLogger } from '../../lib/logger'
import { NotificationChannel, NotificationPayload } from './channel.interface'

export class EmailChannel implements NotificationChannel {
  readonly name = 'email'
  private logger = getLogger()

  isAvailable(): boolean {
    return false
  }

  async send(_payload: NotificationPayload): Promise<void> {
    this.logger.warn('Email channel not implemented — notification not sent')
  }
}
