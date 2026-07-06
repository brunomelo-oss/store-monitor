'use client'

import { useEffect, useState } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { useLang } from '@/contexts/LanguageContext'
import { ArrowDownWideNarrow } from 'lucide-react'

export function InstallChart() {
  const { apps } = useAppContext()
  const { t } = useLang()
  const [anim, setAnim] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnim(true), 100)
    return () => clearTimeout(timer)
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
        {t('installChart.title')}
        <span className="text-xs font-normal text-muted-foreground">{t('installChart.top')}</span>
      </h3>
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="space-y-2.5">
          {withInstalls.map((app, i) => {
            const pct = Math.round((app.installations / maxInst) * 100)
            return (
              <div key={app.id} className="grid grid-cols-[180px_1fr_70px] items-center gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground font-medium shrink-0 w-5 text-right">{i + 1}</span>
                  <span className="text-sm font-semibold text-foreground truncate">{app.name}</span>
                </div>
                <div className="h-7 bg-surface rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-sasi-red to-red-400 transition-all duration-700 ease-out"
                    style={{ width: anim ? `${pct}%` : '0%', minWidth: anim ? '4px' : '0px' }}
                  />
                </div>
                <div className="text-sm font-bold text-muted-foreground text-right">
                  {app.installations.toLocaleString('pt-BR')}
                </div>
              </div>
            )
          })}
        </div>
        {withInstalls.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">{t('installChart.empty')}</div>
        )}
      </div>
    </div>
  )
}
