export interface StoreInfo {
  status: AppStatus
  version: string
  lastUpdate: string
}

export type AppStatus = 'published' | 'review' | 'rejected' | 'pending' | 'unpublished'

export interface App {
  id: number
  name: string
  region: 'Brasil' | 'Internacional'
  icon?: string | null
  packageName?: string | null
  bundleId?: string | null
  city?: string | null
  state?: string | null
  googleAccount: string
  appleAccount: string
  playStore: StoreInfo
  appStore: StoreInfo
  playStatus?: string | null
  playVersion?: string | null
  playLastUpdate?: string | null
  appStatus?: string | null
  appVersion?: string | null
  appLastUpdate?: string | null
  installations: number
  rating: number
  pinned?: boolean
  sortOrder?: number
  organizationId?: number
  storeConnectionId?: number | null
  lastSyncAt?: string | null
  lastSyncStatus?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Account {
  id: string
  name: string
  label?: string
}

export interface Accounts {
  google: Account[]
  apple: Account[]
}

export interface User {
  username: string
  password: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER'
}

export interface Invite {
  id?: number
  email: string
  invitedAt?: string
  createdAt?: string
}

export type ModalMode = 'edit' | 'add' | 'details' | 'password'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
