import { StoreType } from '@prisma/client'
import { SyncProvider } from './provider.interface'
import { ProviderRegistry } from './provider-registry'
import { GooglePlayProvider } from './google-play.provider'
import { AppStoreProvider } from './app-store.provider'

const registry = ProviderRegistry.getInstance()
registry.register(StoreType.GOOGLE, GooglePlayProvider)
registry.register(StoreType.APPLE, AppStoreProvider)

export function getProvider(store: StoreType): SyncProvider {
  return registry.resolve(store)
}

export { ProviderRegistry, SyncProvider, GooglePlayProvider, AppStoreProvider }
export type { ConnectionValidationResult, SyncOperationResult, AppInfoData, VersionData, BuildData, TrackData, ReleaseData, ReviewData, RatingData, AnalyticsData } from './provider.interface'
