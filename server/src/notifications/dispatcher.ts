import { getLogger } from '../lib/logger'
import { NotificationChannel, NotificationPayload } from './channels/channel.interface'
import { InAppChannel } from './channels/in-app.channel'
import { EmailChannel } from './channels/email.channel'
import { WebhookChannel } from './channels/webhook.channel'

export class NotificationDispatcher {
  private channels: NotificationChannel[]
  private logger = getLogger()

  constructor(channels?: NotificationChannel[]) {
    this.channels = channels ?? [
      new InAppChannel(),
      new EmailChannel(),
      new WebhookChannel(),
    ]
  }

  async dispatch(payload: NotificationPayload): Promise<void> {
    const results = await Promise.allSettled(
      this.channels.filter((c) => c.isAvailable()).map((c) => this.dispatchToChannel(c, payload)),
    )

    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.error({ err: result.reason, payload }, 'Notification dispatch failed')
      }
    }
  }

  private async dispatchToChannel(channel: NotificationChannel, payload: NotificationPayload): Promise<void> {
    this.logger.debug({ channel: channel.name, type: payload.type }, 'Dispatching notification')
    await channel.send(payload)
  }
}
