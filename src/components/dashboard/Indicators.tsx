'use client'

import { useAppContext } from '@/contexts/AppContext'
import { overallStatus } from '@/lib/utils'
import { Star, CheckCircle, AlertTriangle } from 'lucide-react'

const accentStyles = {
  star: { icon: 'text-yellow-500', value: 'text-yellow-500' },
  check: { icon: 'text-emerald-500', value: 'text-emerald-500' },
  alert: { icon: 'text-red-500', value: 'text-red-500' },
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <c.icon size={24} className={`mx-auto mb-2 ${c.accent.icon}`} />
          <div className={`text-2xl font-bold tracking-tight ${c.accent.value}`}>{c.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
