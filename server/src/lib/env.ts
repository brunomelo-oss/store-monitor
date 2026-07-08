import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_DIRECT_URL: z.string().min(1, 'DATABASE_DIRECT_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  // Encryption
  CREDENTIAL_ENCRYPTION_KEY: z.string().length(64, 'CREDENTIAL_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)'),

  // Feature flags
  FEATURE_SYNC_ENABLED: z.coerce.boolean().default(false),
  FEATURE_NOTIFICATIONS_ENABLED: z.coerce.boolean().default(true),
  FEATURE_EMAIL_CHANNEL_ENABLED: z.coerce.boolean().default(false),
  FEATURE_WEBHOOK_CHANNEL_ENABLED: z.coerce.boolean().default(false),
  FEATURE_ANALYTICS_ENABLED: z.coerce.boolean().default(false),
  FEATURE_BACKGROUND_JOBS_ENABLED: z.coerce.boolean().default(false),
})

let _env: z.infer<typeof envSchema> | null = null

export function loadEnv(): z.infer<typeof envSchema> {
  if (_env) return _env

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.errors.map(
      (e) => `  ${e.path.join('.')}: ${e.message}`
    ).join('\n')

    throw new Error(
      `❌ Environment validation failed:\n${errors}\n\n` +
      'Please check your .env file and ensure all required variables are set.'
    )
  }

  _env = result.data
  return _env
}

export function getEnv(): z.infer<typeof envSchema> {
  if (!_env) {
    throw new Error('Environment not loaded. Call loadEnv() during startup.')
  }
  return _env
}
