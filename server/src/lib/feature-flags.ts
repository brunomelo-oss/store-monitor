import { getEnv } from './env'

export const featureFlags = {
  get syncEnabled(): boolean {
    return getEnv().FEATURE_SYNC_ENABLED
  },
  get notificationsEnabled(): boolean {
    return getEnv().FEATURE_NOTIFICATIONS_ENABLED
  },
  get emailChannelEnabled(): boolean {
    return getEnv().FEATURE_EMAIL_CHANNEL_ENABLED
  },
  get webhookChannelEnabled(): boolean {
    return getEnv().FEATURE_WEBHOOK_CHANNEL_ENABLED
  },
  get analyticsEnabled(): boolean {
    return getEnv().FEATURE_ANALYTICS_ENABLED
  },
  get backgroundJobsEnabled(): boolean {
    return getEnv().FEATURE_BACKGROUND_JOBS_ENABLED
  },
}
