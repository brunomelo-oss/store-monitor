import { StoreType } from '@prisma/client'
import { SyncProvider } from './provider.interface'

export class ProviderRegistry {
  private static instance: ProviderRegistry
  private providers = new Map<StoreType, new () => SyncProvider>()

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry()
    }
    return ProviderRegistry.instance
  }

  register(store: StoreType, ctor: new () => SyncProvider): void {
    if (this.providers.has(store)) {
      throw new Error(`Provider already registered for store: ${store}`)
    }
    this.providers.set(store, ctor)
  }

  resolve(store: StoreType): SyncProvider {
    const ctor = this.providers.get(store)
    if (!ctor) {
      throw new Error(`No provider registered for store type: ${store}`)
    }
    return new ctor()
  }

  has(store: StoreType): boolean {
    return this.providers.has(store)
  }

  registeredStores(): StoreType[] {
    return Array.from(this.providers.keys())
  }

  reset(): void {
    this.providers.clear()
  }
}
