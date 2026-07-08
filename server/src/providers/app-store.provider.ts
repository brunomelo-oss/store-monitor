import jwt from 'jsonwebtoken'
import { getLogger } from '../lib/logger'
import { appRepository } from '../repositories'
import {
  SyncProvider,
  ConnectionValidationResult,
  SyncOperationResult,
  AppInfoData,
  VersionData,
  BuildData,
  TrackData,
  ReleaseData,
  ReviewData,
  RatingData,
  AnalyticsData,
} from './provider.interface'

const APP_STORE_API = 'https://api.appstoreconnect.apple.com/v1'
const TOKEN_EXPIRY = 20 * 60

interface AppleApp {
  id: string
  attributes: {
    name: string
    bundleId: string
    primaryLocale: string
    sku: string
    contentRightsDeclaration: string
    isOrEverWasMadeForKids: boolean
  }
}

interface AppleAppStoreVersion {
  id: string
  attributes: {
    versionString: string
    appStoreState: string
    storeIcon: { url: string } | null
    createdDate: string
  }
}

interface AppleBuild {
  id: string
  attributes: {
    version: string
    processingState: string
    uploadedDate: string
    iconAssetToken: { url: string } | null
    expirationDate: string
  }
}

interface AppleReview {
  id: string
  attributes: {
    rating: number
    title: string
    body: string
    reviewerNickname: string
    createdDate: string
  }
}

export class AppStoreProvider implements SyncProvider {
  readonly store = 'apple' as const
  readonly displayName = 'App Store Connect'
  private logger = getLogger()
  private issuerId: string = ''
  private keyId: string = ''
  private privateKey: string = ''

  async initialize(config: Record<string, unknown>): Promise<void> {
    this.issuerId = config.issuerId as string
    this.keyId = config.keyId as string
    this.privateKey = config.privateKey as string

    if (!this.issuerId || !this.keyId || !this.privateKey) {
      throw new Error('App Store Provider requires issuerId, keyId, and privateKey in config')
    }

    this.logger.info('App Store Provider initialized')
  }

  private generateToken(): string {
    const now = Math.floor(Date.now() / 1000)
    return jwt.sign(
      {
        iss: this.issuerId,
        exp: now + TOKEN_EXPIRY,
        aud: 'appstoreconnect-v1',
      },
      this.privateKey,
      {
        algorithm: 'ES256',
        keyid: this.keyId,
        header: { alg: 'ES256', kid: this.keyId, typ: 'JWT' },
      },
    )
  }

  private async apiFetch<T>(path: string): Promise<T> {
    const token = this.generateToken()
    const url = `${APP_STORE_API}${path}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`App Store API error ${res.status}: ${body}`)
    }

    const json = await res.json()
    return json as T
  }

  private async findAppleAppId(bundleId: string): Promise<string> {
    const data = await this.apiFetch<{ data: AppleApp[] }>(
      `/apps?filter[bundleId]=${encodeURIComponent(bundleId)}`,
    )

    if (!data.data || data.data.length === 0) {
      throw new Error(`App with bundleId ${bundleId} not found on App Store Connect`)
    }

    return data.data[0].id
  }

  private async getBundleId(appId: number): Promise<string> {
    const app = await appRepository.findById(appId)
    if (!app || !app.bundleId) {
      throw new Error(`App ${appId} not found or missing bundleId`)
    }
    return app.bundleId
  }

  async validateConnection(): Promise<ConnectionValidationResult> {
    try {
      const token = this.generateToken()
      const res = await fetch(`${APP_STORE_API}/apps?limit=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      if (!res.ok) {
        const body = await res.text()
        return { valid: false, message: `App Store API error: ${body}` }
      }

      return { valid: true, message: 'App Store Connect connection validated' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error }, 'App Store connection validation failed')
      return { valid: false, message }
    }
  }

  async syncAppInfo(appId: number): Promise<SyncOperationResult<AppInfoData>> {
    try {
      const bundleId = await this.getBundleId(appId)
      const appleId = await this.findAppleAppId(bundleId)
      const data = await this.apiFetch<{ data: AppleApp }>(`/apps/${appleId}`)

      return {
        success: true,
        data: {
          name: data.data.attributes.name,
          bundleId: data.data.attributes.bundleId,
          developer: undefined,
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'App Store syncAppInfo failed')
      return { success: false, error: message }
    }
  }

  async syncVersions(appId: number): Promise<SyncOperationResult<VersionData[]>> {
    try {
      const bundleId = await this.getBundleId(appId)
      const appleId = await this.findAppleAppId(bundleId)

      const data = await this.apiFetch<{ data: AppleAppStoreVersion[] }>(
        `/apps/${appleId}/appStoreVersions?limit=50`,
      )

      const versions: VersionData[] = (data.data || []).map((v) => ({
        version: v.attributes.versionString,
        status: v.attributes.appStoreState,
        createdAt: v.attributes.createdDate,
      }))

      return { success: true, data: versions }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'App Store syncVersions failed')
      return { success: false, error: message }
    }
  }

  async syncBuilds(appId: number): Promise<SyncOperationResult<BuildData[]>> {
    try {
      const bundleId = await this.getBundleId(appId)
      const appleId = await this.findAppleAppId(bundleId)

      const data = await this.apiFetch<{ data: AppleBuild[] }>(
        `/builds?filter[app]=${appleId}&limit=50&sort=-uploadedDate`,
      )

      const builds: BuildData[] = (data.data || []).map((b) => ({
        buildNumber: b.attributes.version,
        status: b.attributes.processingState,
        artifactUrl: b.attributes.iconAssetToken?.url || undefined,
        createdAt: b.attributes.uploadedDate,
      }))

      return { success: true, data: builds }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'App Store syncBuilds failed')
      return { success: false, error: message }
    }
  }

  async syncTracks(appId: number): Promise<SyncOperationResult<TrackData[]>> {
    try {
      const bundleId = await this.getBundleId(appId)
      const appleId = await this.findAppleAppId(bundleId)

      const data = await this.apiFetch<{ data: AppleAppStoreVersion[] }>(
        `/apps/${appleId}/appStoreVersions?limit=50`,
      )

      const tracks: TrackData[] = (data.data || []).map((v) => ({
        name: v.attributes.appStoreState || 'unknown',
        version: v.attributes.versionString || undefined,
      }))

      return { success: true, data: tracks }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'App Store syncTracks failed')
      return { success: false, error: message }
    }
  }

  async syncReleases(appId: number): Promise<SyncOperationResult<ReleaseData[]>> {
    try {
      const bundleId = await this.getBundleId(appId)
      const appleId = await this.findAppleAppId(bundleId)

      const data = await this.apiFetch<{ data: AppleAppStoreVersion[] }>(
        `/apps/${appleId}/appStoreVersions?limit=50`,
      )

      const releases: ReleaseData[] = (data.data || []).map((v) => ({
        version: v.attributes.versionString || undefined,
        track: v.attributes.appStoreState || undefined,
        status: v.attributes.appStoreState,
        submittedAt: v.attributes.createdDate,
      }))

      return { success: true, data: releases }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'App Store syncReleases failed')
      return { success: false, error: message }
    }
  }

  async syncReviews(appId: number, _page?: number): Promise<SyncOperationResult<ReviewData[]>> {
    try {
      const bundleId = await this.getBundleId(appId)
      const appleId = await this.findAppleAppId(bundleId)

      const data = await this.apiFetch<{ data: AppleReview[] }>(
        `/apps/${appleId}/customerReviews?limit=50&sort=-createdDate`,
      )

      const reviews: ReviewData[] = (data.data || []).map((r) => ({
        reviewId: r.id,
        author: r.attributes.reviewerNickname || 'Unknown',
        score: r.attributes.rating,
        title: r.attributes.title || undefined,
        content: r.attributes.body || undefined,
        createdAt: r.attributes.createdDate,
      }))

      return { success: true, data: reviews }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'App Store syncReviews failed')
      return { success: false, error: message }
    }
  }

  async syncRatings(_appId: number): Promise<SyncOperationResult<RatingData>> {
    this.logger.warn('App Store ratings not directly available via API')
    return { success: false, error: 'App Store Connect API does not directly expose aggregated ratings' }
  }

  async syncAnalytics(_appId: number, _since: Date): Promise<SyncOperationResult<AnalyticsData>> {
    this.logger.warn('App Store analytics not directly available via this API')
    return { success: false, error: 'App Store Connect API analytics require additional data access' }
  }
}
