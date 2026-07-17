import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { MOCK_APPS } from '@/lib/mock-data'
import type { App } from '@/types'

export interface AppDetail {
  id: number
  name: string
  region: string
  icon: string | null
  packageName: string | null
  bundleId: string | null
  googleAccount: string | null
  appleAccount: string | null
  playStatus: string | null
  playVersion: string | null
  playLastUpdate: string | null
  appStatus: string | null
  appVersion: string | null
  appLastUpdate: string | null
  installations: number | null
  rating: number | null
  pinned: boolean
  sortOrder: number
  organizationId: number
  storeConnectionId: number | null
  createdAt: string
  updatedAt: string
  versions?: Array<Record<string, unknown>>
  builds?: Array<Record<string, unknown>>
  tracks?: Array<Record<string, unknown>>
  publications?: Array<Record<string, unknown>>
  analytics?: Array<Record<string, unknown>>
  ratings?: Array<Record<string, unknown>>
  reviews?: Array<Record<string, unknown>>
  rejections?: Array<Record<string, unknown>>
  storeConnection?: Record<string, unknown> | null
}

function adaptAppToDetail(app: App): AppDetail {
  return {
    id: app.id,
    name: app.name,
    region: app.region,
    icon: null,
    packageName: app.packageName || null,
    bundleId: app.bundleId || null,
    googleAccount: app.googleAccount || null,
    appleAccount: app.appleAccount || null,
    playStatus: app.playStore?.status || null,
    playVersion: app.playStore?.version || null,
    playLastUpdate: app.playStore?.lastUpdate || null,
    appStatus: app.appStore?.status || null,
    appVersion: app.appStore?.version || null,
    appLastUpdate: app.appStore?.lastUpdate || null,
    installations: app.installations ?? null,
    rating: app.rating ?? null,
    pinned: app.pinned ?? false,
    sortOrder: app.sortOrder || 0,
    organizationId: 1,
    storeConnectionId: app.storeConnectionId ?? null,
    createdAt: app.createdAt || '',
    updatedAt: app.updatedAt || '',
  }
}

export function useAppDetail(id: number) {
  return useQuery({
    queryKey: ['app', id] as const,
    queryFn: async () => {
      try {
        return await apiClient<AppDetail>(`/apps/${id}`)
      } catch {
        const mock = MOCK_APPS.find(a => a.id === id)
        if (mock) return adaptAppToDetail(mock)
        throw new Error(`App ${id} not found`)
      }
    },
    enabled: !!id,
  })
}
