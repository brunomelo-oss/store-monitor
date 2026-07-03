'use client'

import { useAppContext } from '@/contexts/AppContext'
import { overallStatus } from '@/lib/utils'
import { Star, CheckCircle, AlertTriangle } from 'lucide-react'

const accentStyles = {
  star: { icon: 'bg-yellow-500/10 text-yellow-400', value: 'text-yellow-400' },
  check: { icon: 'bg-emerald-500/10 text-emerald-400', value: 'text-emerald-400' },
  alert: { icon: 'bg-red-500/10 text-red-400', value: 'text-red-400' },
}

export function Indicators() {
  const { hasRealData } = useAppContext()

  const healthy = hasRealData.filter(a => overallStatus(a) === 'published').length
  const rejected = hasRealData.filter(a => overallStatus(a) === 'rejected').length
  const appsWithRating = hasRealData.filter(a => a.rating > 0)
  const avgRating = appsWithRating.length > 0
    ? appsWithRating.reduce((s, a) => s + a.rating, 0) / appsWithRating.length
    : 0

  const cards = [
    { icon: Star, value: avgRating.toFixed(1), label: 'Média Geral', accent: accentStyles.star },
    { icon: CheckCircle, value: healthy.toString(), label: 'Apps Saudáveis', accent: accentStyles.check },
    { icon: AlertTriangle, value: rejected.toString(), label: 'Com Rejeição', accent: accentStyles.alert },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-surface border border-border rounded-xl p-5 text-center transition-all duration-200 hover:border-zinc-500"
        >
          <div className={`w-11 h-11 mx-auto rounded-xl flex items-center justify-center mb-3 ${c.accent.icon}`}>
            <c.icon size={22} />
          </div>
          <div className={`text-2xl font-bold ${c.accent.value}`}>{c.value}</div>
          <div className="text-xs text-zinc-500 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
