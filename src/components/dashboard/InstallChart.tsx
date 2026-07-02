'use client'

import { useAppContext } from '@/contexts/AppContext'
import { ArrowDownWideNarrow } from 'lucide-react'

export function InstallChart() {
  const { apps } = useAppContext()

  const withInstalls = apps
    .filter(a => a.installations > 0)
    .sort((a, b) => b.installations - a.installations)

  const maxInst = withInstalls.length > 0 ? withInstalls[0].installations : 1

  return (
    <div>
      <h3 className="flex items-center gap-2 text-base font-bold text-white mb-4">
        <ArrowDownWideNarrow size={18} className="text-zinc-400" />
        Instalações por App
      </h3>
      <div className="space-y-2.5">
        {withInstalls.map(app => {
          const pct = Math.round((app.installations / maxInst) * 100)
          return (
            <div key={app.id} className="grid grid-cols-[160px_1fr_70px] items-center gap-3">
              <div className="text-sm font-semibold text-white truncate">{app.name}</div>
              <div className="h-7 bg-surface rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-sasi-red to-red-400 transition-all duration-500"
                  style={{ width: `${pct}%`, minWidth: '4px' }}
                />
              </div>
              <div className="text-sm font-bold text-right text-zinc-400">
                {app.installations.toLocaleString('pt-BR')}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
