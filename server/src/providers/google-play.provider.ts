import { google } from 'googleapis'
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

export class GooglePlayProvider implements SyncProvider {
  readonly store = 'google' as const
  readonly displayName = 'Google Play Console'
  private logger = getLogger()
  private androidPublisher: ReturnType<typeof google.androidpublisher> | null = null
  private auth: any = null

  async initialize(config: Record<string, unknown>): Promise<void> {
    const clientEmail = config.clientEmail as string
    const privateKey = config.privateKey as string

    if (!clientEmail || !privateKey) {
      throw new Error('Google Play Provider requires clientEmail and privateKey in config')
    }

    this.auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    })

    this.androidPublisher = google.androidpublisher({ version: 'v3', auth: this.auth })
    this.logger.info('Google Play Provider initialized')
  }

  async validateConnection(): Promise<ConnectionValidationResult> {
    if (!this.androidPublisher) {
      return { valid: false, message: 'Provider not initialized' }
    }

    try {
      await this.auth.authorize()
      return { valid: true, message: 'Google Play connection validated' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error }, 'Google Play connection validation failed')
      return { valid: false, message }
    }
  }

  private async getPackageName(appId: number): Promise<string> {
    const app = await appRepository.findById(appId)
    if (!app || !app.packageName) {
      throw new Error(`App ${appId} not found or missing packageName`)
    }
    return app.packageName
  }

  private async createEdit(packageName: string): Promise<{ id: string }> {
    if (!this.androidPublisher) throw new Error('Provider not initialized')
    const res = await this.androidPublisher.edits.insert({ packageName })
    return { id: res.data.id! }
  }

  private async commitEdit(packageName: string, editId: string): Promise<void> {
    if (!this.androidPublisher) throw new Error('Provider not initialized')
    await this.androidPublisher.edits.commit({ packageName, editId })
  }

  async syncAppInfo(appId: number): Promise<SyncOperationResult<AppInfoData>> {
    try {
      const packageName = await this.getPackageName(appId)
      const app = await appRepository.findById(appId)

      return {
        success: true,
        data: {
          name: app?.name || packageName,
          packageName,
          icon: app?.icon || undefined,
          developer: undefined,
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'Google Play syncAppInfo failed')
      return { success: false, error: message }
    }
  }

  async syncVersions(appId: number): Promise<SyncOperationResult<VersionData[]>> {
    try {
      const packageName = await this.getPackageName(appId)
      const edit = await this.createEdit(packageName)
      const tracksRes = await this.androidPublisher!.edits.tracks.list({ packageName, editId: edit.id })
      await this.commitEdit(packageName, edit.id)

      const versions: VersionData[] = []
      const tracks = (tracksRes.data.tracks || []) as any[]

      for (const track of tracks) {
        const releases = (track.releases || []) as any[]
        for (const release of releases) {
          if (release.name) {
            versions.push({
              version: release.name,
              buildNumber: release.versionCodes?.[0] || undefined,
              status: release.status || 'unknown',
              releaseNotes: release.releaseNotes?.[0]?.text || undefined,
              createdAt: release.userFraction != null
                ? new Date().toISOString()
                : new Date().toISOString(),
            })
          }
        }
      }

      return { success: true, data: versions }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'Google Play syncVersions failed')
      return { success: false, error: message }
    }
  }

  async syncBuilds(appId: number): Promise<SyncOperationResult<BuildData[]>> {
    try {
      const packageName = await this.getPackageName(appId)
      const edit = await this.createEdit(packageName)
      const tracksRes = await this.androidPublisher!.edits.tracks.list({ packageName, editId: edit.id })
      await this.commitEdit(packageName, edit.id)

      const builds: BuildData[] = []
      const tracks = (tracksRes.data.tracks || []) as any[]

      for (const track of tracks) {
        const releases = (track.releases || []) as any[]
        for (const release of releases) {
          const versionCodes = (release.versionCodes || []) as string[]
          for (const versionCode of versionCodes) {
            builds.push({
              buildNumber: String(versionCode),
              version: release.name || undefined,
              status: release.status || 'unknown',
              createdAt: new Date().toISOString(),
            })
          }
        }
      }

      return { success: true, data: builds }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'Google Play syncBuilds failed')
      return { success: false, error: message }
    }
  }

  async syncTracks(appId: number): Promise<SyncOperationResult<TrackData[]>> {
    try {
      const packageName = await this.getPackageName(appId)
      const edit = await this.createEdit(packageName)
      const tracksRes = await this.androidPublisher!.edits.tracks.list({ packageName, editId: edit.id })
      await this.commitEdit(packageName, edit.id)

      const rawTracks = (tracksRes.data.tracks || []) as any[]
      const tracks: TrackData[] = rawTracks.map((track) => ({
        name: track.track || 'unknown',
        fraction: track.userFraction || undefined,
        version: track.releases?.[0]?.name || undefined,
      }))

      return { success: true, data: tracks }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'Google Play syncTracks failed')
      return { success: false, error: message }
    }
  }

  async syncReleases(appId: number): Promise<SyncOperationResult<ReleaseData[]>> {
    try {
      const packageName = await this.getPackageName(appId)
      const edit = await this.createEdit(packageName)
      const tracksRes = await this.androidPublisher!.edits.tracks.list({ packageName, editId: edit.id })
      await this.commitEdit(packageName, edit.id)

      const releases: ReleaseData[] = []
      const rawTracks = (tracksRes.data.tracks || []) as any[]

      for (const track of rawTracks) {
        const trackReleases = (track.releases || []) as any[]
        for (const release of trackReleases) {
          releases.push({
            version: release.name || undefined,
            buildNumber: release.versionCodes?.[0]?.toString() || undefined,
            track: track.track || undefined,
            status: release.status || 'unknown',
            submittedAt: release.status?.includes('inProgress') ? new Date().toISOString() : '',
          })
        }
      }

      return { success: true, data: releases }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'Google Play syncReleases failed')
      return { success: false, error: message }
    }
  }

  async syncReviews(appId: number, _page?: number): Promise<SyncOperationResult<ReviewData[]>> {
    try {
      const packageName = await this.getPackageName(appId)
      const res = await this.androidPublisher!.reviews.list({ packageName })

      const rawReviews = (res.data.reviews || []) as any[]
      const reviews: ReviewData[] = rawReviews.map((review: any) => ({
        reviewId: review.reviewId || '',
        author: review.authorName || 'Unknown',
        score: review.comments?.[0]?.userComment?.starRating || 0,
        title: review.comments?.[0]?.userComment?.text?.substring(0, 100) || undefined,
        content: review.comments?.[0]?.userComment?.text || undefined,
        createdAt: review.comments?.[0]?.userComment?.lastModified?.seconds
          ? new Date(Number(review.comments[0].userComment.lastModified.seconds) * 1000).toISOString()
          : new Date().toISOString(),
      }))

      return { success: true, data: reviews }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ err: error, appId }, 'Google Play syncReviews failed')
      return { success: false, error: message }
    }
  }

  async syncRatings(_appId: number): Promise<SyncOperationResult<RatingData>> {
    this.logger.warn('Google Play ratings not available via Publisher API')
    return { success: false, error: 'Google Play Developer API does not expose aggregated ratings' }
  }

  async syncAnalytics(_appId: number, _since: Date): Promise<SyncOperationResult<AnalyticsData>> {
    this.logger.warn('Google Play analytics not available via Publisher API')
    return { success: false, error: 'Google Play Developer API does not expose analytics data' }
  }
}
