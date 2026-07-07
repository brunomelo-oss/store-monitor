'use client'

import { useAppContext } from '@/contexts/AppContext'
import { useLang } from '@/contexts/LanguageContext'
import { Star } from 'lucide-react'

export function RatingsGrid() {
  const { apps } = useAppContext()
  const { t } = useLang()

  const withRatings = apps.filter(a => a.rating > 0)

  if (withRatings.length === 0) {
    return (
      <div>
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
          <Star size={18} className="text-yellow-500" />
          {t('ratings.title')}
        </h3>
        <div className="text-center text-sm text-muted-foreground py-12 bg-card border border-border rounded-2xl card-glass shadow-sm">
          {t('ratings.empty')}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Star size={18} className="text-yellow-500" />
        <h3 className="text-base font-bold text-foreground">{t('ratings.title')}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {withRatings.map((app, i) => {
          const full = Math.floor(app.rating)
          const hasHalf = app.rating - full >= 0.5
          const empty = 5 - full - (hasHalf ? 1 : 0)

          return (
            <div
              key={app.id}
              className="bg-card border border-border rounded-[14px] p-4 text-center card-glass transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="text-sm font-semibold text-foreground truncate mb-2">{app.name}</div>
              <div className="text-lg font-bold text-foreground mb-1">{app.rating.toFixed(1)}</div>
              <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: full }).map((_, j) => (
                  <Star key={`f${j}`} size={14} className="fill-yellow-500 text-yellow-500" />
                ))}
                {hasHalf && (
                  <div className="relative">
                    <Star size={14} className="text-zinc-300 dark:text-zinc-600" />
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                      <Star size={14} className="fill-yellow-500 text-yellow-500" />
                    </div>
                  </div>
                )}
                {Array.from({ length: empty }).map((_, j) => (
                  <Star key={`e${j}`} size={14} className="text-zinc-300 dark:text-zinc-600" />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">{t('ratings.scale')}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
