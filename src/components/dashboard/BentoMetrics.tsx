'use client'

import { useAppContext } from '@/contexts/AppContext'
import { overallStatus } from '@/lib/utils'
import { Smartphone, CheckCircle2, TriangleAlert } from 'lucide-react'

const iconMap = {
  Smartphone: Smartphone,
  CheckCircle2: CheckCircle2,
  TriangleAlert: TriangleAlert,
}

interface MetricCardProps {
  icon: keyof typeof iconMap
  label: string
  value: number
  sub: string
  accent: 'default' | 'success' | 'danger'
}

const accentStyles = {
  default: {
    icon: 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-500 dark:text-zinc-400',
    value: 'text-foreground',
  },
  success: {
    icon: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-600 dark:text-emerald-400',
  },
  danger: {
    icon: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    value: 'text-red-600 dark:text-red-400',
  },
}

function MetricCard({ icon, label, value, sub, accent }: MetricCardProps) {
  const Icon = iconMap[icon]
  const s = accentStyles[accent]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.icon}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className={`text-3xl font-bold tracking-tight ${s.value} mb-1`}>{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  )
}

export function BentoMetrics() {
  const { hasRealData } = useAppContext()

  const total = hasRealData.length
  const healthy = hasRealData.filter(a => overallStatus(a) === 'published').length
  const rejected = hasRealData.filter(a => overallStatus(a) === 'rejected').length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <MetricCard icon="Smartphone" label="Total de Apps" value={total} sub="Mapeados nas contas de produção" accent="default" />
      <MetricCard icon="CheckCircle2" label="Status Saudável" value={healthy} sub={`${healthy} aplicativos operando normalmente`} accent="success" />
      <MetricCard icon="TriangleAlert" label="Rejeições Ativas" value={rejected} sub="Ações imediatas necessárias na Play Store" accent="danger" />
    </div>
  )
}
