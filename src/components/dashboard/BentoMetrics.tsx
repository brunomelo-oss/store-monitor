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
    card: 'bg-surface',
    icon: 'bg-zinc-800 text-zinc-400',
    value: 'text-foreground',
    label: 'text-zinc-500',
  },
  success: {
    card: 'bg-emerald-500/[0.03] border-emerald-500/10',
    icon: 'bg-emerald-500/10 text-emerald-400',
    value: 'text-emerald-400',
    label: 'text-zinc-500',
  },
  danger: {
    card: 'bg-red-950/20',
    icon: 'bg-red-500/10 text-red-400',
    value: 'text-red-400',
    label: 'text-zinc-500',
  },
}

function MetricCard({ icon, label, value, sub, accent }: MetricCardProps) {
  const Icon = iconMap[icon]
  const s = accentStyles[accent]

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border p-5 ${s.card} transition-all duration-200 hover:border-zinc-500`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.icon}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className={`text-3xl font-bold ${s.value} mb-1`}>{value}</div>
      <div className="text-xs text-zinc-500">{sub}</div>
    </div>
  )
}

export function BentoMetrics() {
  const { hasRealData } = useAppContext()

  const total = hasRealData.length
  const healthy = hasRealData.filter(a => overallStatus(a) === 'published').length
  const rejected = hasRealData.filter(a => overallStatus(a) === 'rejected').length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetricCard icon="Smartphone" label="Total de Apps" value={total} sub="Mapeados nas contas de produção" accent="default" />
      <MetricCard icon="CheckCircle2" label="Status Saudável" value={healthy} sub={`${healthy} aplicativos operando normalmente`} accent="success" />
      <MetricCard icon="TriangleAlert" label="Rejeições Ativas" value={rejected} sub="Ações imediatas necessárias na Play Store" accent="danger" />
    </div>
  )
}
