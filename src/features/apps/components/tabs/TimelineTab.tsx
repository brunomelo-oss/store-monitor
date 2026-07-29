'use client'

import { Timeline, type TimelineEvent } from '@/components/Timeline'

export function TimelineTab({ events }: { events: TimelineEvent[] }) {
  return <Timeline events={events} />
}
