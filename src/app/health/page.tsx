'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { useHealth } from '@/features/health/hooks/useHealth'
import { Spinner, LoadingSkeleton } from '@/components/LoadingSkeleton'
import { ErrorState } from '@/components/ErrorState'
import { MetricCard } from '@/components/MetricCard'
import { CheckCircle, XCircle, AlertTriangle, Globe, Apple, Database, Activity, Bell, BarChart3, RefreshCw, Clock, HeartPulse } from 'lucide-react'

const statusIcon = (status: string) => {
  if (status === 'healthy') return <CheckCircle size={18} className="text-green-500" />
  if (status === 'degraded') return <AlertTriangle size={18} className="text-yellow-500" />
  return <XCircle size={18} className="text-red-500" />
}

export default function HealthPage() {
  const { user, loading } = useAuth()
  const { data: health, isLoading, error, refetch } = useHealth()

  if (loading || !user) return <Spinner />
  if (error) return <ErrorState onRetry={() => refetch()} />
  if (!health) return <LoadingSkeleton />

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Saúde do Sistema</h1>
            <p className="text-muted-foreground mt-1">Monitoramento e observabilidade da plataforma</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            health.status === 'healthy' ? 'bg-green-500/10 text-green-400' :
            health.status === 'degraded' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {statusIcon(health.status)}
            {health.status === 'healthy' ? 'Saudável' : health.status === 'degraded' ? 'Degradado' : 'Crítico'}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard title="Uptime" value={`${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m`} icon={<Clock size={16} />} />
          <MetricCard title="Versão" value={health.version} icon={<HeartPulse size={16} />} />
          <MetricCard title="Ambiente" value={health.environment} icon={<Globe size={16} />} />
          <MetricCard title="Syncs (24h)" value={health.metrics.totalSyncs24h} subtitle={`${health.metrics.failedSyncs24h} falhas`} variant={health.metrics.failedSyncs24h > 0 ? 'warning' : 'default'} icon={<RefreshCw size={16} />} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Componentes</h2>
          <div className="grid gap-3">
            {[
              { label: 'Banco de Dados', icon: Database, check: health.checks.database },
              { label: 'API', icon: Activity, check: health.checks.api },
              { label: 'Sync', icon: RefreshCw, check: health.checks.sync },
              { label: 'Notificações', icon: Bell, check: health.checks.notifications },
              { label: 'Analytics', icon: BarChart3, check: health.checks.analytics },
              { label: 'Background Jobs', icon: Activity, check: health.checks.backgroundJobs },
            ].map(c => (
              <div key={c.label} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <c.icon size={18} className="text-muted-foreground" />
                  <span className="font-medium">{c.label}</span>
                  {(c.check as any).message && <span className="text-xs text-muted-foreground">({(c.check as any).message})</span>}
                </div>
                <div className="flex items-center gap-2">
                  {(c.check as any).latency && <span className="text-xs text-muted-foreground">{(c.check as any).latency}ms</span>}
                  {statusIcon(c.check.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Providers</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { label: 'Google Play', icon: Globe, check: health.checks.providers.google },
              { label: 'App Store', icon: Apple, check: health.checks.providers.apple },
            ].map(p => (
              <div key={p.label} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <p.icon size={18} className="text-muted-foreground" />
                  <span className="font-medium">{p.label}</span>
                </div>
                {statusIcon(p.check.status)}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Métricas</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Latência de Sync" value={health.metrics.syncLatency ? `${(health.metrics.syncLatency.value / 1000).toFixed(1)}s` : '—'} icon={<Clock size={16} />} />
            <MetricCard title="Duração Média Jobs" value={health.metrics.averageJobDuration ? `${(health.metrics.averageJobDuration.value / 1000).toFixed(1)}s` : '—'} icon={<Clock size={16} />} />
            <MetricCard title="Jobs Pendentes" value={health.metrics.pendingJobs} variant={health.metrics.pendingJobs > 0 ? 'warning' : 'default'} icon={<Activity size={16} />} />
            <MetricCard title="Falhas (24h)" value={health.metrics.failedJobs24h} variant={health.metrics.failedJobs24h > 0 ? 'danger' : 'default'} icon={<XCircle size={16} />} />
          </div>
        </div>
      </main>
    </div>
  )
}
