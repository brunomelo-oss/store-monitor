'use client'

import { useLang } from '@/contexts/LanguageContext'
import { useHealth } from '@/hooks/useHealth'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatLocaleDate } from '@/lib/utils'
import { Activity as ActivityIcon, HeartPulse } from 'lucide-react'

const VARIANT = { ok: 'success', degraded: 'warning', down: 'danger' } as const
const REPORT_VARIANT = { healthy: 'success', degraded: 'warning', down: 'danger' } as const

export function HealthView() {
  const { t, lang } = useLang()
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'ar-SA'
  const { data: report, isLoading } = useHealth()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!report) {
    return <EmptyState icon={HeartPulse} title="Indisponível" description="Não foi possível obter o relatório de saúde." />
  }

  const okCount = report.checks.filter(c => c.status === 'ok').length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saúde do sistema</h1>
          <p className="text-sm text-muted-foreground mt-1">{report.checks.length} componentes monitorados · {formatLocaleDate(report.timestamp, locale)}</p>
        </div>
        <Badge variant={REPORT_VARIANT[report.status]} className="capitalize !px-3 !py-1.5 !text-sm">
          {report.status === 'healthy' ? 'Saudável' : report.status === 'degraded' ? 'Degradado' : 'Fora do ar'}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="sasi-card rounded-xl p-5">
          <p className="text-xs text-muted-foreground">Uptime</p>
          <p className="text-2xl font-bold text-foreground mt-1">{(report.uptime / 3600).toFixed(1)}h</p>
        </div>
        <div className="sasi-card rounded-xl p-5">
          <p className="text-xs text-muted-foreground">Componentes OK</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{okCount}/{report.checks.length}</p>
        </div>
        <div className="sasi-card rounded-xl p-5">
          <p className="text-xs text-muted-foreground">Status geral</p>
          <p className="text-2xl font-bold text-foreground mt-1 capitalize">{report.status}</p>
        </div>
      </div>

      <div className="sasi-card rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <ActivityIcon size={16} className="text-muted-foreground" /> Componentes
        </h3>
        <div className="space-y-2">
          {report.checks.map(c => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg bg-surface/60 border border-border">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-current text-muted-foreground/30" />
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                {c.latency != null && <span className="text-xs text-muted-foreground">{c.latency}ms</span>}
              </div>
              <div className="flex items-center gap-3">
                {c.detail && <span className="text-xs text-muted-foreground">{c.detail}</span>}
                <Badge variant={VARIANT[c.status]} dot className="capitalize">{c.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}