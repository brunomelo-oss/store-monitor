import { test } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'crypto'
import { AuthService, AuthServiceDeps } from '../services/auth.service'
import { ValidationError, AuthenticationError } from '../lib/errors'
import { loadEnv } from '../lib/env'

process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex')
process.env.JWT_REFRESH_SECRET = crypto.randomBytes(64).toString('hex')
loadEnv()

async function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function buildService(overrides: Partial<AuthServiceDeps> = {}): AuthService {
  return new AuthService({
    userRepository: {
      findByEmail: async () => null,
      findById: async () => null,
      findByEmailOrUsername: async () => null,
      findByUsername: async () => null,
      create: async () => ({}),
    } as any,
    passwordResetTokenRepository: {
      findByTokenHash: async () => null,
    } as any,
    withTx: (async () => {}) as any,
    ...overrides,
  } as any)
}

test('forgotPassword for an unknown email is silent (no enumeration)', async () => {
  const service = buildService({
    userRepository: { findByEmail: async () => null } as any,
  })
  await assert.doesNotReject(service.forgotPassword('nobody@example.com'))
})

test('resetPassword rejects an invalid token', async () => {
  const service = buildService()
  await assert.rejects(
    service.resetPassword('totally-invalid-token', 'NewStrongPass1!'),
    (err: any) => err instanceof ValidationError && err.message === 'Token inválido ou expirado',
  )
})

test('resetPassword rejects an expired or used token (repository returns null)', async () => {
  const service = buildService({
    passwordResetTokenRepository: { findByTokenHash: async () => null } as any,
  })
  await assert.rejects(
    service.resetPassword('some-token', 'NewStrongPass1!'),
    (err: any) => err instanceof ValidationError && err.message === 'Token inválido ou expirado',
  )
})

test('resetPassword hashes the token before looking it up', async () => {
  const token = crypto.randomBytes(32).toString('hex')
  let lookedUp: string | null = null
  const service = buildService({
    passwordResetTokenRepository: {
      findByTokenHash: async (hash: string) => {
        lookedUp = hash
        return null
      },
    } as any,
    withTx: (async () => {}) as any,
  })
  await assert.rejects(service.resetPassword(token, 'NewStrongPass1!'))
  assert.notEqual(lookedUp, token, 'raw token must never be persisted/looked up')
  assert.equal(lookedUp, await sha256(token), 'lookup must use SHA-256 hash of the token')
})

test('login denies a user with valid credentials but no organization (no org defaulting)', async () => {
  const service = buildService({
    userRepository: {
      findByEmailOrUsername: async () => ({
        id: 1,
        username: 'noorg',
        email: 'noorg@example.com',
        password: 'hashed',
        role: 'ADMIN',
        organizationId: null,
      }),
    } as any,
    comparePassword: (async () => true) as any,
  })
  await assert.rejects(
    service.login({ username: 'noorg', password: 'whatever' }),
    (err: any) => err instanceof AuthenticationError && err.message === 'Conta sem organização vinculada',
  )
})

test('login succeeds for a user with an organization', async () => {
  const service = buildService({
    userRepository: {
      findByEmailOrUsername: async () => ({
        id: 1,
        username: 'orguser',
        email: 'orguser@example.com',
        password: 'hashed',
        role: 'ADMIN',
        organizationId: 7,
      }),
    } as any,
    passwordResetTokenRepository: { findByTokenHash: async () => null } as any,
    comparePassword: (async () => true) as any,
    withTx: (async () => {}) as any,
  })
  const result = await service.login({ username: 'orguser', password: 'whatever' })
  assert.equal(result.user.organizationId, 7)
})
