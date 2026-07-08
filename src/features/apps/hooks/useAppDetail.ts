import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'

export interface AppDetail {
  id: number
  name: string
  region: string
  icon: string | null
  packageName: string | null
  bundleId: string | null
  googleAccount: string | null
  appleAccount: string | null
  playStatus: string | null
  playVersion: string | null
  playLastUpdate: string | null
  appStatus: string | null
  appVersion: string | null
  appLastUpdate: string | null
  installations: number | null
  rating: number | null
  pinned: boolean
  sortOrder: number
  organizationId: number
  storeConnectionId: number | null
  createdAt: string
  updatedAt: string
  versions?: Array<Record<string, unknown>>
  builds?: Array<Record<string, unknown>>
  tracks?: Array<Record<string, unknown>>
  publications?: Array<Record<string, unknown>>
  analytics?: Array<Record<string, unknown>>
  ratings?: Array<Record<string, unknown>>
  reviews?: Array<Record<string, unknown>>
  rejections?: Array<Record<string, unknown>>
  storeConnection?: Record<string, unknown> | null
}

export function useAppDetail(id: number) {
  return useQuery({
    queryKey: ['app', id] as const,
    queryFn: () => apiClient<AppDetail>(`/apps/${id}`),
    enabled: !!id,
  })
}
