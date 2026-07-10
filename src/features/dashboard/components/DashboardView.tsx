'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { MetricCard } from '@/components/MetricCard'
import { useApps } from '@/hooks/useApps'
import { useSyncHistory } from '@/features/sync/hooks/useSyncHistory'
import { useActivity } from '@/features/activity/hooks/useActivity'
import { Spinner } from '@/components/LoadingSkeleton'
import {
  Smartphone, CheckCircle, XCircle, Clock,
  RefreshCw, Globe, Apple, Edit, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export function DashboardView() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className="space-y-8">
        <ErrorBoundary><CommandCenter /></ErrorBoundary>
      </div>
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-lg bg-muted" />)}
      </div>
      <div className="h-40 rounded-lg bg-muted" />
    </div>
  )
}

function CommandCenter() {
  const { data: apps = [] } = useApps()
  const { data: syncHistory = [] } = useSyncHistory()
  const { data: activity = [] } = useActivity(10)

  const totalApps = apps.length
  const publishedApps = apps.filter(a => a.playStatus === 'PUBLISHED' || a.appStatus === 'PUBLISHED').length
  const inReviewApps = apps.filter(a => a.playStatus === 'REVIEW' || a.appStatus === 'REVIEW').length
  const rejectedApps = apps.filter(a => a.playStatus === 'REJECTED' || a.appStatus === 'REJECTED').length
  const approvalRate = totalApps > 0 ? Math.round((publishedApps / totalApps) * 100) : 0

  const getLastSync = (store: string) => {
    const entries = syncHistory.filter(s => s.store === store)
    if (entries.length === 0) return null
    return entries.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]
  }

  const lastGoogleSync = getLastSync('GOOGLE')
  const lastAppleSync = getLastSync('APPLE')

  const statusCards = [
    {
      label: 'Publicados',
      value: `${publishedApps} de ${totalApps}`,
      icon: Smartphone,
      variant: 'success' as const,
      filter: 'PUBLISHED',
    },
    {
      label: 'Em Revisão',
      value: inReviewApps,
      icon: Clock,
      variant: 'warning' as const,
      filter: 'REVIEW',
    },
    {
      label: 'Rejeitados',
      value: rejectedApps,
      icon: XCircle,
      variant: rejectedApps > 0 ? ('danger' as const) : ('default' as const),
      filter: 'REJECTED',
    },
    {
      label: 'Taxa Aprovação',
      value: `${approvalRate}%`,
      icon: CheckCircle,
      variant: approvalRate >= 80 ? ('success' as const) : approvalRate >= 50 ? ('warning' as const) : ('danger' as const),
    },
  ]

  const activityIcon = (action: string) => {
    const a = action.toUpperCase()
    if (a.includes('BUILD_APPROVED') || a.includes('SUCCESS')) return { icon: CheckCircle, color: 'text-green-400' }
    if (a.includes('BUILD_REJECTED') || a.includes('REJECT')) return { icon: XCircle, color: 'text-red-400' }
    if (a.includes('APP_EDITED') || a.includes('UPDATE')) return { icon: Edit, color: 'text-blue-400' }
    if (a.includes('SYNC_OK') || a.includes('SYNC') || a.includes('RUNNING')) return { icon: RefreshCw, color: 'text-green-400' }
    return { icon: RefreshCw, color: 'text-zinc-400' }
  }

  if (!apps.length && !syncHistory.length) return <Spinner />

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Command Center</h2>
        <p className="text-sm text-muted-foreground">O que precisa de atenção hoje?</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statusCards.map(card => (
          <Link key={card.label} href={card.filter ? `/apps?status=${card.filter}` : '#'}>
            <MetricCard
              title={card.label}
              value={card.value}
              icon={<card.icon size={16} />}
              variant={card.variant}
            />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Últimas Atividades</h3>
          <div className="space-y-3">
            {activity.slice(0, 5).map(a => {
              const { icon: Icon, color } = activityIcon(a.action)
              return (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                    <Icon size={12} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate">{a.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              )
            })}
            <Link href="/activity" className="flex items-center gap-1 text-sm text-blue-400 hover:underline pt-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Status de Sincronização</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Globe size={16} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Google Play</p>
                  {lastGoogleSync ? (
                    <p className="text-xs text-muted-foreground">
                      Último sync: {new Date(lastGoogleSync.startedAt).toLocaleString('pt-BR')}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhum sync realizado</p>
                  )}
                </div>
              </div>
              {lastGoogleSync ? (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  lastGoogleSync.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' :
                  lastGoogleSync.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {lastGoogleSync.status === 'SUCCESS' ? 'OK' : lastGoogleSync.status === 'FAILED' ? 'Erro' : lastGoogleSync.status}
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400">—</span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Apple size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">App Store</p>
                  {lastAppleSync ? (
                    <p className="text-xs text-muted-foreground">
                      Último sync: {new Date(lastAppleSync.startedAt).toLocaleString('pt-BR')}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhum sync realizado</p>
                  )}
                </div>
              </div>
              {lastAppleSync ? (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  lastAppleSync.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' :
                  lastAppleSync.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {lastAppleSync.status === 'SUCCESS' ? 'OK' : lastAppleSync.status === 'FAILED' ? 'Erro' : lastAppleSync.status}
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
