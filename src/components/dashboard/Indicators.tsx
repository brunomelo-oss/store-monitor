'use client'

import { useAppContext } from '@/contexts/AppContext'
import { overallStatus } from '@/lib/utils'
import { Star, CheckCircle, AlertTriangle } from 'lucide-react'

export function Indicators() {
  const { hasRealData } = useAppContext()

  const healthy = hasRealData.filter(a => overallStatus(a) === 'published').length
  const rejected = hasRealData.filter(a => overallStatus(a) === 'rejected').length
  const appsWithRating = hasRealData.filter(a => a.rating > 0)
  const avgRating = appsWithRating.length > 0
    ? appsWithRating.reduce((s, a) => s + a.rating, 0) / appsWithRating.length
    : 0

  const cards = [
    { icon: Star, value: avgRating.toFixed(1), label: 'Média Geral', color: 'text-yellow-400' },
    { icon: CheckCircle, value: healthy.toString(), label: 'Apps Saudáveis', color: 'text-emerald-400' },
    { icon: AlertTriangle, value: rejected.toString(), label: 'Com Rejeição', color: 'text-red-400' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((c, i) => (
        <div key={i} className="bg-surface border border-zinc-800 rounded-xl p-5 text-center">
          <c.icon size={24} className={`${c.color} mx-auto mb-2`} />
          <div className="text-2xl font-bold text-white">{c.value}</div>
          <div className="text-xs text-zinc-500 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
