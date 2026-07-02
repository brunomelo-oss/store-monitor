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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-white">{region}</h3>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeClass || 'bg-emerald-500/10 text-emerald-400'}`}>
            {badge}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {apps.map(app => (
          <AppCard key={app.id} app={app} onEdit={onEdit} onDetails={onDetails} />
        ))}
      </div>
    </div>
  )
}
