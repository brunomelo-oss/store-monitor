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
        <ArrowDownWideNarrow size={18} className="text-zinc-400" />
        Instalações por App
        <span className="text-xs font-normal text-zinc-600">· Top 10</span>
      </h3>
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="space-y-3">
          {withInstalls.map((app, i) => {
            const pct = Math.round((app.installations / maxInst) * 100)
            return (
              <div key={app.id} className="flex items-center gap-3">
                <div className="w-8 text-xs text-zinc-600 font-mono text-right shrink-0">{i + 1}</div>
                <div className="w-[140px] text-sm font-medium text-foreground truncate shrink-0">{app.name}</div>
                <div className="flex-1 h-6 bg-zinc-800 rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-sasi-red to-red-400 transition-all duration-700 ease-out"
                    style={{ width: anim ? `${pct}%` : '0%', minWidth: anim ? '4px' : '0px' }}
                  />
                </div>
                <div className="w-[70px] text-sm font-semibold text-right text-zinc-400 shrink-0">
                  {app.installations.toLocaleString('pt-BR')}
                </div>
              </div>
            )
          })}
        </div>
        {withInstalls.length === 0 && (
          <div className="text-center text-sm text-zinc-600 py-8">Nenhum app com instalações registradas</div>
        )}
      </div>
    </div>
  )
}
