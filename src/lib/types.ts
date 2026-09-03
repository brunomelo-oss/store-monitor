export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER'
export type Region = 'Brasil' | 'Internacional'
export type AppStatus = 'published' | 'review' | 'rejected' | 'pending' | 'unpublished'
export type ModalMode = 'edit' | 'add' | 'details' | 'password'
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface AuthUser {
  id: number
  username: string
  email: string
  role: Role
}

export interface StoreInfo {
  status: AppStatus
  version: string
  lastUpdate: string
}

export interface AppIssue {
  store: 'google' | 'apple'
  status: string
  message?: string
  date?: string
}

export interface App {
  id: number
  name: string
  region: Region
  city?: string | null
  state?: string | null
  icon?: string | null
  packageName?: string | null
  bundleId?: string | null
  googleAccount: string
  appleAccount: string
  playStore: StoreInfo
  appStore: StoreInfo
  installations: number
  rating: number
  pinned?: boolean
  sortOrder?: number
  createdAt?: string
  lastSyncAt?: string | null
  issues?: AppIssue[]
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

export interface Invite {
  id: number
  email: string
  createdAt: string
}

export interface User {
  id: number
  username: string
  email: string
  role: Role
}

export type StoreKind = 'GOOGLE' | 'APPLE'

export interface StoreConnection {
  id: number
  store: StoreKind
  label: string
  isActive: boolean
  lastSyncAt: string | null
}

export type ActivityType = 'audit_log' | 'sync' | 'notification' | 'job'

export interface ActivityItem {
  id: string
  type: ActivityType
  action: string
  entity?: string
  entityId?: number | null
  description: string
  username?: string | null
  createdAt: string
}

export type NotificationPriority = 'high' | 'medium' | 'low'
export type NotificationCategory = 'approval' | 'rejection' | 'new_version' | 'build' | 'sync' | 'system'

export interface NotificationItem {
  id: number
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  read: boolean
  appId?: number | null
  createdAt: string
}

export type SyncJobStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'IGNORED' | 'PARTIAL'

export interface SyncJob {
  id: number
  appId: number
  appName: string
  store: StoreKind
  status: SyncJobStatus
  message?: string | null
  createdAt: string
  finishedAt?: string | null
}

export interface SyncHistoryItem {
  id: number
  appId: number
  appName: string
  store: StoreKind
  status: SyncJobStatus
  message?: string | null
  syncedAt: string
}

export interface HealthComponent {
  name: string
  status: 'ok' | 'degraded' | 'down'
  latency?: number
  detail?: string
}

export interface HealthReport {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  checks: HealthComponent[]
  timestamp: string
}