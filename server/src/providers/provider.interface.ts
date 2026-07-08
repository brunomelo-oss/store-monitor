import { StoreType } from '@prisma/client'

export interface ConnectionValidationResult {
  valid: boolean
  message?: string
  details?: Record<string, unknown>
}

export interface SyncOperationResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface AppInfoData {
  name: string
  icon?: string
  packageName?: string
  bundleId?: string
  description?: string
  developer?: string
}

export interface VersionData {
  version: string
  buildNumber?: string
  status: string
  releaseNotes?: string
  createdAt: string
}

export interface BuildData {
  buildNumber: string
  version?: string
  status: string
  artifactUrl?: string
  createdAt: string
}

export interface TrackData {
  name: string
  version?: string
  fraction?: number
}

export interface ReleaseData {
  version?: string
  buildNumber?: string
  track?: string
  status: string
  submittedAt: string
  publishedAt?: string
  rejectedAt?: string
  rejectionReason?: string
}

export interface ReviewData {
  reviewId: string
  author: string
  score: number
  title?: string
  content?: string
  reply?: string
  createdAt: string
}

export interface RatingData {
  score: number
  count: number
}

export interface AnalyticsData {
  downloads: number
  installs: number
  impressions: number
  pageViews: number
  crashes: number
  date: string
}

export interface SyncProvider {
  readonly store: 'google' | 'apple'
  readonly displayName: string

  initialize(config: Record<string, unknown>): Promise<void>
  validateConnection(): Promise<ConnectionValidationResult>

  syncAppInfo(appId: number): Promise<SyncOperationResult<AppInfoData>>
  syncVersions(appId: number): Promise<SyncOperationResult<VersionData[]>>
  syncBuilds(appId: number): Promise<SyncOperationResult<BuildData[]>>
  syncTracks(appId: number): Promise<SyncOperationResult<TrackData[]>>
  syncReleases(appId: number): Promise<SyncOperationResult<ReleaseData[]>>
  syncReviews(appId: number, page?: number): Promise<SyncOperationResult<ReviewData[]>>
  syncRatings(appId: number): Promise<SyncOperationResult<RatingData>>
  syncAnalytics(appId: number, since: Date): Promise<SyncOperationResult<AnalyticsData>>
}
