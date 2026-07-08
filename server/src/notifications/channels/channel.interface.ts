import { NotificationType } from '@prisma/client'

export interface NotificationPayload {
  type: NotificationType
  title: string
  message: string
  organizationId: number
  appId?: number
  userId?: number
  metadata?: Record<string, unknown>
}

export interface NotificationChannel {
  readonly name: string
  send(payload: NotificationPayload): Promise<void>
  isAvailable(): boolean
}
