'use client'

import { useAppContext } from '@/contexts/AppContext'
import { overallStatus } from '@/lib/utils'
import { Smartphone, CheckCircle2, TriangleAlert } from 'lucide-react'

export function BentoMetrics() {
  const { hasRealData } = useAppContext()

  const total = hasRealData.length
  const healthy = hasRealData.filter(a => overallStatus(a) === 'published').length
  const rejected = hasRealData.filter(a => overallStatus(a) === 'rejected').length

  const metrics = [
    {
      icon: Smartphone,
      label: 'Total de Apps',
      value: total,
      sub: 'Mapeados nas contas de produção',
      color: 'text-white',
      iconColor: 'text-zinc-400',
    },
    {
      icon: CheckCircle2,
      label: 'Status Saudável',
      value: healthy,
      sub: `${healthy} aplicativos operando normalmente`,
      color: 'text-emerald-400',
      iconColor: 'text-emerald-400',
    },
    {
      icon: TriangleAlert,
      label: 'Rejeições Ativas',
      value: rejected,
      sub: 'Ações imediatas necessárias na Play Store',
      color: 'text-red-400',
      iconColor: 'text-red-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {metrics.map((m, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-xl border border-zinc-800 p-5 ${
            i === 2 ? 'bg-red-950/20' : 'bg-surface'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{m.label}</span>
            <m.icon size={20} className={m.iconColor} />
          </div>
          <div className={`text-3xl font-bold ${m.color} mb-1`}>{m.value}</div>
          <div className="text-xs text-zinc-500">{m.sub}</div>
        </div>
      ))}
    </div>
  )
}
