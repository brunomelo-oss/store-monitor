import { describe, it, expect, beforeAll } from 'vitest'
import { gateways } from '@/data'
import type { AuthUser } from '@/lib/types'

const wait = () => new Promise(r => setTimeout(r, 30))

describe('mock gateways (data layer)', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_DATA_MODE = 'mock'
  })

  it('exposes all gateway objects', () => {
    for (const key of ['auth', 'apps', 'users', 'connections', 'activity', 'notifications', 'sync', 'health']) {
      expect(gateways[key as keyof typeof gateways]).toBeDefined()
    }
  })

  describe('auth', () => {
    it('logs in an existing user', async () => {
      const user: AuthUser = await gateways.auth.login('bruninho', 'Admin123@')
      expect(user.email).toBeTruthy()
      expect(user.role).toBeDefined()
      await wait()
    })

    it('resolves me/logout/setup/reset', async () => {
      await expect(gateways.auth.me()).resolves.toHaveProperty('username')
      await expect(gateways.auth.logout()).resolves.toBeUndefined()
      await expect(gateways.auth.setupAccount('x@y.com', 'Password1@', 'token-x')).resolves.toBeUndefined()
      await expect(gateways.auth.resetPassword('x@y.com', 'Password1@')).resolves.toBeUndefined()
      await wait()
    })
  })

  describe('apps', () => {
    it('lists apps and returns seed with accounts', async () => {
      const apps = await gateways.apps.list()
      expect(apps.length).toBeGreaterThan(0)
      const accounts = await gateways.apps.getAccounts()
      expect(accounts.google.length).toBeGreaterThan(0)
      expect(accounts.apple.length).toBeGreaterThan(0)
      await wait()
    })

    it('creates, updates and removes an app', async () => {
      const created = await gateways.apps.create({
        name: 'Test App Mock',
        region: 'Brasil',
        googleAccount: 'sasTech',
        appleAccount: 'sasTech',
        playStatus: 'unpublished',
        playVersion: '',
        playLastUpdate: '',
        appStatus: 'unpublished',
        appVersion: '',
        appLastUpdate: '',
      })
      expect(created.id).toBeDefined()
      expect(created.name).toBe('Test App Mock')

      const updated = await gateways.apps.update(created.id, { playVersion: '1.0.0' })
      expect(updated.playStore.version).toBe('1.0.0')

      await gateways.apps.remove(created.id)
      await expect(gateways.apps.getById(created.id)).rejects.toThrow()
      await wait()
    })

    it('toggles pin and moves apps around', async () => {
      const apps = await gateways.apps.list()
      const first = apps[0]
      const before = !!first.pinned
      const toggled = await gateways.apps.togglePin(first.id)
      expect(toggled.pinned).toBe(!before)
      const again = await gateways.apps.togglePin(first.id)
      expect(again.pinned).toBe(before)
      const moved = await gateways.apps.move(first.id, 'down')
      expect(Array.isArray(moved)).toBe(true)
      await wait()
    })
  })

  describe('users', () => {
    it('lists users and manages invites', async () => {
      const users = await gateways.users.list()
      expect(users.length).toBeGreaterThan(0)

      const invite = await gateways.users.createInvite('novo@sasi.com.br')
      expect(invite.email).toBe('novo@sasi.com.br')
      await gateways.users.deleteInvite(invite.id)
      await wait()
    })

    it('updates role and password', async () => {
      const users = await gateways.users.list()
      const target = users.find(u => u.role !== 'OWNER') ?? users[0]
      const updated = await gateways.users.updateRole(target.id, 'ADMIN')
      expect(updated.role).toBe('ADMIN')
      await expect(gateways.users.updatePassword(target.id, 'NewPass123@')).resolves.toBeUndefined()
      await wait()
    })
  })

  describe('connections', () => {
    it('lists, creates, tests and removes a connection', async () => {
      const list = await gateways.connections.list()
      expect(Array.isArray(list)).toBe(true)

      const created = await gateways.connections.create({ store: 'GOOGLE', label: 'Teste Mock' })
      expect(created.id).toBeDefined()
      const result = await gateways.connections.test(created.id)
      expect(typeof result.ok).toBe('boolean')
      await gateways.connections.remove(created.id)
      await wait()
    })
  })

  describe('activity / notifications / sync / health', () => {
    it('lists activity and filters by type', async () => {
      const all = await gateways.activity.list({ limit: 100 })
      expect(all.length).toBeGreaterThan(0)
      const syncOnly = await gateways.activity.list({ types: ['sync'] })
      expect(syncOnly.every(a => a.type === 'sync')).toBe(true)
      await wait()
    })

    it('lists notifications and marks as read', async () => {
      const list = await gateways.notifications.list({ limit: 100 })
      expect(list.length).toBeGreaterThan(0)
      await gateways.notifications.markAsRead(list[0].id)
      await gateways.notifications.markAllAsRead()
      await wait()
    })

    it('returns sync jobs and health report', async () => {
      const jobs = await gateways.sync.listJobs()
      expect(Array.isArray(jobs)).toBe(true)
      const history = await gateways.sync.listHistory()
      expect(Array.isArray(history)).toBe(true)
      const health = await gateways.health.check()
      expect(health.status).toBeTruthy()
      expect(health.checks.length).toBeGreaterThan(0)
      await wait()
    })
  })
})