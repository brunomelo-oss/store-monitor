import { getEnv } from './lib/env'

function env() {
  return getEnv()
}

export const config = {
  get port() { return env().PORT },
  get nodeEnv() { return env().NODE_ENV },
  get frontendUrl() { return env().FRONTEND_URL },
  jwt: {
    get secret() { return env().JWT_SECRET },
    get refreshSecret() { return env().JWT_REFRESH_SECRET },
    accessExpiresIn: '15m' as const,
    refreshExpiresIn: '7d' as const,
  },
  encryption: {
    get key() { return env().CREDENTIAL_ENCRYPTION_KEY ?? '' },
    algorithm: 'aes-256-gcm' as const,
  },
  features: {
    get sync() { return env().FEATURE_SYNC_ENABLED },
    get storeConnections() { return env().FEATURE_STORE_CONNECTIONS_ENABLED },
    get notifications() { return env().FEATURE_NOTIFICATIONS_ENABLED },
    get emailChannel() { return env().FEATURE_EMAIL_CHANNEL_ENABLED },
    get webhookChannel() { return env().FEATURE_WEBHOOK_CHANNEL_ENABLED },
    get analytics() { return env().FEATURE_ANALYTICS_ENABLED },
    get backgroundJobs() { return env().FEATURE_BACKGROUND_JOBS_ENABLED },
  },
}
