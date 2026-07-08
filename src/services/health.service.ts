import { apiClient } from './api-client'

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: { status: string; message?: string; latency?: number }
    api: { status: string }
    sync: { status: string; message?: string }
    notifications: { status: string; message?: string }
    analytics: { status: string; message?: string }
    backgroundJobs: { status: string; message?: string }
    providers: {
      google: { status: string }
      apple: { status: string }
    }
  }
  metrics: {
    syncLatency: { value: number; unit: string } | null
    averageJobDuration: { value: number; unit: string } | null
    failedJobs24h: number
    pendingJobs: number
    totalSyncs24h: number
    failedSyncs24h: number
  }
}

export const healthService = {
  async check() {
    return apiClient<HealthStatus>('/v1/health')
  },
}
