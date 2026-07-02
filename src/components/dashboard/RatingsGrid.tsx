'use client'

import { useAppContext } from '@/contexts/AppContext'
import { Star } from 'lucide-react'

export function RatingsGrid() {
  const { apps } = useAppContext()

  const withRatings = apps.filter(a => a.rating > 0)

  return (
    <div>
      <h3 className="flex items-center gap-2 text-base font-bold text-white mb-4">
        <Star size={18} className="text-yellow-400" />
        Avaliação Média
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {withRatings.map(app => {
          const full = Math.floor(app.rating)
          const half = app.rating - full >= 0.5 ? 1 : 0
          const empty = 5 - full - half
          return (
            <div key={app.id} className="bg-surface border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-sm font-semibold text-white truncate mb-2">{app.name}</div>
              <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: full }).map((_, i) => (
                  <Star key={`full-${i}`} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
                {half === 1 && <Star size={16} className="fill-yellow-400 text-yellow-400" />}
                {Array.from({ length: empty }).map((_, i) => (
                  <Star key={`empty-${i}`} size={16} className="text-zinc-600" />
                ))}
              </div>
              <div className="text-xs text-zinc-500">{app.rating.toFixed(1)} / 5.0</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
