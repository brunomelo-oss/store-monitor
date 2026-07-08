import { UserRole, Region, StoreType, SyncStatus, NotificationType, JobType, JobStatus, SyncTriggerType } from '@prisma/client'

// ─── API Response Types ───────────────────────────────────────────

export interface ApiResponse<T = Record<string, unknown>> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}

// ─── Auth Types ────────────────────────────────────────────────────

export interface AuthUser {
  id: number
  username: string
  email: string
  role: UserRole
  organizationId: number | null
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// ─── App Types ────────────────────────────────────────────────────

export interface AppStoreInfo {
  status?: string
  version?: string
  lastUpdate?: string
}

export interface AppResponse {
  id: number
  name: string
  region: Region | string
  icon: string | null
  packageName: string | null
  bundleId: string | null
  googleAccount: string
  appleAccount: string
  playStore: AppStoreInfo
  appStore: AppStoreInfo
  installations: number
  rating: number
  pinned: boolean
  sortOrder: number
  storeConnectionId: number | null
  lastSyncAt: string | null
  lastSyncStatus: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAppRequest {
  name: string
  region?: Region
  icon?: string
  packageName?: string
  bundleId?: string
  googleAccount?: string
  appleAccount?: string
  playStore?: AppStoreInfo
  appStore?: AppStoreInfo
  installations?: number
  rating?: number
  storeConnectionId?: number | null
}

export interface UpdateAppRequest {
  name?: string
  region?: Region
  icon?: string
  packageName?: string
  bundleId?: string
  googleAccount?: string
  appleAccount?: string
  playStore?: AppStoreInfo
  appStore?: AppStoreInfo
  installations?: number
  rating?: number
  storeConnectionId?: number | null
}

// ─── User Types ───────────────────────────────────────────────────

export interface UserResponse {
  id: number
  username: string
  email: string
  role: UserRole
  avatarUrl: string | null
  createdAt: string
}

export interface CreateUserRequest {
  email: string
  password: string
  role: UserRole
}

// ─── Sync Types ───────────────────────────────────────────────────

export interface SyncResult {
  appId?: number
  store?: StoreType
  type: string
  status: SyncStatus
  message?: string
  duration: number
}

// ─── Notification Types ───────────────────────────────────────────

export interface NotificationResponse {
  id: number
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  appId?: number
}

// ─── Invite Types ─────────────────────────────────────────────────

export interface InviteRequest {
  email: string
  role?: UserRole
}

export interface InviteResponse {
  id: number
  email: string
  role: UserRole
  createdAt: string
}

// ─── Store Connection Types ───────────────────────────────────────

export interface StoreConnectionResponse {
  id: number
  store: StoreType
  label: string
  isActive: boolean
  lastSyncAt: string | null
}

export interface CreateStoreConnectionRequest {
  store: StoreType
  label: string
  credentials: Record<string, unknown>
}

export interface ConnectionTestResult {
  valid: boolean
  message?: string
  store: StoreType
  label: string
}

// ─── Job Types ────────────────────────────────────────────────────

export interface JobResponse {
  id: number
  type: JobType
  status: JobStatus
  payload?: Record<string, unknown>
  result?: Record<string, unknown>
  error?: string
  retryCount: number
  maxRetries: number
  lastError?: string
  stack?: string
  duration?: number
  lastRetryAt?: string
  triggerType: SyncTriggerType
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
}

// ─── Analytics Types ──────────────────────────────────────────────

export interface AnalyticsSummary {
  totalDownloads: number
  totalInstalls: number
  averageRating: number
  totalApps: number
  healthyApps: number
  rejectedApps: number
}
