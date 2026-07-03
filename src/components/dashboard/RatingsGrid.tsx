'use client'

import { useAppContext } from '@/contexts/AppContext'
import { Star } from 'lucide-react'

export function RatingsGrid() {
  const { apps } = useAppContext()

  const withRatings = apps.filter(a => a.rating > 0)

  if (withRatings.length === 0) {
    return (
      <div>
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
          <Star size={18} className="text-yellow-500" />
          Avaliação Média
        </h3>
        <div className="text-center text-sm text-muted-foreground py-12 bg-card border border-border rounded-2xl shadow-sm">
          Nenhuma avaliação disponível
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Star size={18} className="text-yellow-500" />
        <h3 className="text-base font-bold text-foreground">Avaliação Média</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {withRatings.map((app, i) => {
          const full = Math.floor(app.rating)
          const hasHalf = app.rating - full >= 0.5
          const empty = 5 - full - (hasHalf ? 1 : 0)

          return (
            <div
              key={app.id}
              className="bg-card border border-border rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="text-sm font-semibold text-foreground truncate mb-3">{app.name}</div>
              <div className="flex justify-center gap-0.5 mb-2">
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
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold text-foreground">{app.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/ 5.0</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
