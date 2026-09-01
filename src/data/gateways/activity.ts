import type { ActivityItem, ActivityType } from '@/lib/types'

export interface ActivityGateway {
  list(opts?: { limit?: number; types?: ActivityType[] }): Promise<ActivityItem[]>
}