import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_DIRECT_URL: z.string().min(1, 'DATABASE_DIRECT_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  // Encryption — required only when credential-store features are enabled
  CREDENTIAL_ENCRYPTION_KEY: z.string().length(64).optional(),

  // Feature flags
  FEATURE_SYNC_ENABLED: z.string().default('false').transform(v => v === 'true'),
  FEATURE_STORE_CONNECTIONS_ENABLED: z.string().default('false').transform(v => v === 'true'),
  FEATURE_NOTIFICATIONS_ENABLED: z.string().default('true').transform(v => v === 'true'),
  FEATURE_EMAIL_CHANNEL_ENABLED: z.string().default('false').transform(v => v === 'true'),
  FEATURE_WEBHOOK_CHANNEL_ENABLED: z.string().default('false').transform(v => v === 'true'),
  FEATURE_ANALYTICS_ENABLED: z.string().default('false').transform(v => v === 'true'),
  FEATURE_BACKGROUND_JOBS_ENABLED: z.string().default('false').transform(v => v === 'true'),
}).superRefine((data, ctx) => {
  const needsEncryption = data.FEATURE_SYNC_ENABLED || data.FEATURE_STORE_CONNECTIONS_ENABLED
  if (needsEncryption && !data.CREDENTIAL_ENCRYPTION_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['CREDENTIAL_ENCRYPTION_KEY'],
      message: 'CREDENTIAL_ENCRYPTION_KEY is required when FEATURE_SYNC_ENABLED or FEATURE_STORE_CONNECTIONS_ENABLED is true',
    })
  }
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
