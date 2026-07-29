import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { MOCK_APPS } from '@/lib/mock-data'
import { logError } from '@/lib/logger'
import type { App } from '@/types'

export interface VersionItem {
  id: number
  version: string
  versionId: string
  status: string
  store: string
  buildNumber: string
  createdAt: string
}

export interface BuildItem {
  id: number
  buildNumber: string
  store: string
  status: string
  createdAt: string
  artifactUrl?: string
}

export interface ReleaseItem {
  id: number
  status: string
  store: string
  submittedAt?: string
  publishedAt?: string
  rejectionReason?: string
}

export interface TrackItem {
  id: number
  name: string
  fraction?: string
}

export interface AnalyticsItem {
  id: number
  date: string
  downloads: number
  installs: number
  pageViews: number
  crashes: number
}

export interface RatingItem {
  id: number
  score: number
  count: number
  date: string
}

export interface ReviewItem {
  id: number
  author: string
  score: number
  title?: string
  content?: string
  createdAt: string
}

export interface RejectionItem {
  id: number
  reason: string
  message?: string
  createdAt: string
}

export interface StoreConnectionItem {
  id: number
  store: string
  label: string
  isActive: boolean
}

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
  googleStoreConnectionId: number | null
  appleStoreConnectionId: number | null
  createdAt: string
  updatedAt: string
  versions?: VersionItem[]
  builds?: BuildItem[]
  tracks?: TrackItem[]
  publications?: ReleaseItem[]
  releases?: ReleaseItem[]
  analytics?: AnalyticsItem[]
  ratings?: RatingItem[]
  reviews?: ReviewItem[]
  rejections?: RejectionItem[]
  storeConnection?: StoreConnectionItem | null
  googleStoreConnection?: StoreConnectionItem | null
  appleStoreConnection?: StoreConnectionItem | null
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
    googleStoreConnectionId: app.googleStoreConnectionId ?? app.storeConnectionId ?? null,
    appleStoreConnectionId: app.appleStoreConnectionId ?? app.storeConnectionId ?? null,
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
      } catch (e) { logError('useAppDetail', e)
        const mock = MOCK_APPS.find(a => a.id === id)
        if (mock) return adaptAppToDetail(mock)
        throw new Error(`App ${id} not found`)
      }
    },
    enabled: !!id,
  })
}
