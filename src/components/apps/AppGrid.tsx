'use client'

import { App } from '@/types'
import { AppCard } from './AppCard'

interface AppGridProps {
  apps: App[]
  region: string
  badge: string
  badgeClass?: string
  onEdit: (app: App) => void
  onDetails: (app: App) => void
}

export function AppGrid({ apps, region, badge, badgeClass, onEdit, onDetails }: AppGridProps) {
  if (apps.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-foreground">{region}</h3>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeClass || 'bg-surface text-muted-foreground border border-border'}`}>
            {badge}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{apps.length} app{apps.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {apps.map((app, i) => (
          <AppCard key={app.id} app={app} onEdit={onEdit} onDetails={onDetails} index={i} />
        ))}
      </div>
    </div>
  )
}
