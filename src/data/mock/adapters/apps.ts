import { mockAccounts, mockApps } from '../mock-data'
import { withLatency, clone, nextId } from '../helpers'
import type { AppsGateway, AppInput } from '../../gateways'
import type { App } from '@/lib/types'

let apps: App[] = clone(mockApps)

export const mockAppsGateway: AppsGateway = {
  async list() {
    return withLatency(clone(apps))
  },
  async getById(id) {
    const app = apps.find(a => a.id === id)
    if (!app) throw new Error('App não encontrado')
    return withLatency(clone(app))
  },
  async create(input) {
    const app: App = {
      id: nextId(apps),
      name: input.name,
      region: input.region,
      googleAccount: input.googleAccount,
      appleAccount: input.appleAccount,
      playStore: { status: input.playStatus, version: input.playVersion, lastUpdate: input.playLastUpdate },
      appStore: { status: input.appStatus, version: input.appVersion, lastUpdate: input.appLastUpdate },
      installations: input.installations ?? 0,
      rating: input.rating ?? 0,
      pinned: false,
      sortOrder: apps.length + 1,
      createdAt: new Date().toISOString(),
    }
    apps = [...apps, app]
    return withLatency(clone(app))
  },
  async update(id, input) {
    const index = apps.findIndex(a => a.id === id)
    if (index === -1) throw new Error('App não encontrado')
    const current = apps[index]
    const next: App = {
      ...current,
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.region !== undefined ? { region: input.region } : {}),
      ...(input.googleAccount !== undefined ? { googleAccount: input.googleAccount } : {}),
      ...(input.appleAccount !== undefined ? { appleAccount: input.appleAccount } : {}),
      ...(input.playStatus !== undefined || input.playVersion !== undefined || input.playLastUpdate !== undefined
        ? { playStore: { status: input.playStatus ?? current.playStore.status, version: input.playVersion ?? current.playStore.version, lastUpdate: input.playLastUpdate ?? current.playStore.lastUpdate } }
        : {}),
      ...(input.appStatus !== undefined || input.appVersion !== undefined || input.appLastUpdate !== undefined
        ? { appStore: { status: input.appStatus ?? current.appStore.status, version: input.appVersion ?? current.appStore.version, lastUpdate: input.appLastUpdate ?? current.appStore.lastUpdate } }
        : {}),
      ...(input.installations !== undefined ? { installations: input.installations } : {}),
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
    }
    apps = apps.map(a => a.id === id ? next : a)
    return withLatency(clone(next))
  },
  async remove(id) {
    apps = apps.filter(a => a.id !== id)
    return withLatency(undefined as unknown as void)
  },
  async togglePin(id) {
    const index = apps.findIndex(a => a.id === id)
    if (index === -1) throw new Error('App não encontrado')
    const next = { ...apps[index], pinned: !apps[index].pinned }
    apps = apps.map(a => a.id === id ? next : a)
    return withLatency(clone(next))
  },
  async move(id, direction) {
    const index = apps.findIndex(a => a.id === id)
    if (index === -1) throw new Error('App não encontrado')
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= apps.length) return withLatency(clone(apps))
    const nextApps = [...apps]
    const [item] = nextApps.splice(index, 1)
    nextApps.splice(target, 0, item)
    nextApps.forEach((a, i) => { a.sortOrder = i + 1 })
    apps = nextApps
    return withLatency(clone(apps))
  },
  async getAccounts() {
    return withLatency(clone(mockAccounts))
  },
}