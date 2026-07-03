'use client'

import { useEffect, useState } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { ArrowDownWideNarrow } from 'lucide-react'

export function InstallChart() {
  const { apps } = useAppContext()
  const [anim, setAnim] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnim(true), 100)
    return () => clearTimeout(t)
  }, [])

  const withInstalls = apps
    .filter(a => a.installations > 0)
    .sort((a, b) => b.installations - a.installations)
    .slice(0, 10)

  const maxInst = withInstalls.length > 0 ? withInstalls[0].installations : 1

  return (
    <div>
      <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
        <ArrowDownWideNarrow size={18} className="text-muted-foreground" />
        Instalações por App
        <span className="text-xs font-normal text-muted-foreground">· Top 10</span>
      </h3>
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="space-y-3">
          {withInstalls.map((app, i) => {
            const pct = Math.round((app.installations / maxInst) * 100)
            return (
              <div key={app.id} className="flex items-center gap-4">
                <div className="w-7 text-xs text-muted-foreground font-medium text-right shrink-0">{i + 1}</div>
                <div className="w-[140px] text-sm font-medium text-foreground truncate shrink-0">{app.name}</div>
                <div className="flex-1 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sasi-blue to-blue-400 transition-all duration-700 ease-out"
                    style={{ width: anim ? `${pct}%` : '0%', minWidth: anim ? '4px' : '0px' }}
                  />
                </div>
                <div className="w-[70px] text-sm font-semibold text-right text-muted-foreground shrink-0">
                  {app.installations.toLocaleString('pt-BR')}
                </div>
              </div>
            )
          })}
        </div>
        {withInstalls.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">Nenhum app com instalações registradas</div>
        )}
      </div>
    </div>
  )
}
