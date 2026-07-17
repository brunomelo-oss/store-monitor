import { apiClient } from './api-client'

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: { status: string; message?: string; latency?: number }
    api: { status: string; message?: string; latency?: number }
    sync: { status: string; message?: string; latency?: number }
    notifications: { status: string; message?: string; latency?: number }
    analytics: { status: string; message?: string; latency?: number }
    backgroundJobs: { status: string; message?: string; latency?: number }
    providers: {
      google: { status: string; message?: string; latency?: number }
      apple: { status: string; message?: string; latency?: number }
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
