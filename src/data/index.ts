import { mockAuthGateway } from './mock/adapters/auth'
import { mockAppsGateway } from './mock/adapters/apps'
import { mockUsersGateway } from './mock/adapters/users'
import { mockStoreConnectionsGateway } from './mock/adapters/store-connections'
import { mockActivityGateway } from './mock/adapters/activity'
import { mockNotificationsGateway } from './mock/adapters/notifications'
import { mockSyncGateway } from './mock/adapters/sync'
import { mockHealthGateway } from './mock/adapters/health'

import { apiAuthGateway } from './api/adapters/auth'
import { apiAppsGateway } from './api/adapters/apps'
import { apiUsersGateway } from './api/adapters/users'
import { apiStoreConnectionsGateway } from './api/adapters/store-connections'
import { apiActivityGateway } from './api/adapters/activity'
import { apiNotificationsGateway } from './api/adapters/notifications'
import { apiSyncGateway } from './api/adapters/sync'
import { apiHealthGateway } from './api/adapters/health'

export type DataMode = 'mock' | 'api'

function detectMode(): DataMode {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DATA_MODE === 'api') return 'api'
  return 'mock'
}

export const DATA_MODE: DataMode = detectMode()

export const gateways = {
  auth: DATA_MODE === 'api' ? apiAuthGateway : mockAuthGateway,
  apps: DATA_MODE === 'api' ? apiAppsGateway : mockAppsGateway,
  users: DATA_MODE === 'api' ? apiUsersGateway : mockUsersGateway,
  connections: DATA_MODE === 'api' ? apiStoreConnectionsGateway : mockStoreConnectionsGateway,
  activity: DATA_MODE === 'api' ? apiActivityGateway : mockActivityGateway,
  notifications: DATA_MODE === 'api' ? apiNotificationsGateway : mockNotificationsGateway,
  sync: DATA_MODE === 'api' ? apiSyncGateway : mockSyncGateway,
  health: DATA_MODE === 'api' ? apiHealthGateway : mockHealthGateway,
} as const

export type Gateways = typeof gateways