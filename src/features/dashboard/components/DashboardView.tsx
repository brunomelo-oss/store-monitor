'use client'

import { Suspense, useMemo } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { MetricCard } from '@/components/MetricCard'
import { Badge } from '@/components/Badge'
import { Progress } from '@/components/Progress'
import { Tooltip } from '@/components/Tooltip'
import { EmptyState } from '@/components/EmptyState'
import { useApps } from '@/hooks/useApps'
import { useActivity } from '@/features/activity/hooks/useActivity'
import { Spinner } from '@/components/LoadingSkeleton'
import {
  Smartphone, CheckCircle, XCircle, Clock,
  BarChart3, Activity, Bell,
  Download, Plus,
  AlertTriangle, Hourglass, TrendingUp, Globe,
  Apple, Edit, RefreshCw,
  ArrowUpRight, ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  const shimmer = 'rounded-xl bg-muted animate-pulse'

  return (
    <div className="space-y-8">
      <div className={`h-24 ${shimmer}`} />
      <div className={`h-10 ${shimmer}`} />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className={`h-28 ${shimmer}`} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`h-80 lg:col-span-2 ${shimmer}`} />
        <div className={`h-80 ${shimmer}`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`h-64 ${shimmer}`} />
        <div className={`h-64 ${shimmer}`} />
      </div>
    </div>
  )
}

function CommandCenter() {
  const router = useRouter()
  const { data: apps = [], isLoading: appsLoading } = useApps()
  const { data: activity = [] } = useActivity(20)

  const totalApps = apps.length
  const publishedApps = apps.filter(a => a.playStatus === 'PUBLISHED' || a.appStatus === 'PUBLISHED').length
  const inReviewApps = apps.filter(a => a.playStatus === 'REVIEW' || a.appStatus === 'REVIEW').length
  const rejectedApps = apps.filter(a => a.playStatus === 'REJECTED' || a.appStatus === 'REJECTED').length
  const needsAttentionApps = apps.filter(a => {
    const s = (a.playStatus || a.appStatus || '').toUpperCase()
    return s === 'REJECTED' || s === 'FAILED' || s === 'PENDING'
  }).length
  const pendingBuilds = apps.filter(a => {
    const s = (a.playStatus || a.appStatus || '').toUpperCase()
    return s === 'PENDING' || s === 'REVIEW'
  }).length

  const approvalRate = totalApps > 0 ? Math.round((publishedApps / totalApps) * 100) : 0

  const recentApps = [...apps].sort((a, b) => {
    const aDate = a.updatedAt || a.createdAt
    const bDate = b.updatedAt || b.createdAt
    return new Date(bDate ?? 0).getTime() - new Date(aDate ?? 0).getTime()
  }).slice(0, 8)

  const priorities = apps.filter(a => {
    const s = (a.playStatus || a.appStatus || '').toUpperCase()
    return s === 'REJECTED' || s === 'PENDING' || s === 'FAILED' || s === 'PUBLISHED'
  }).slice(0, 5)

  const kpiCards = [
    { label: 'Publicados', value: publishedApps, icon: Smartphone, variant: 'success' as const, subtitle: `${totalApps} no total` },
    { label: 'Em Revisão', value: inReviewApps, icon: Clock, variant: 'warning' as const },
    { label: 'Precisam de Atenção', value: needsAttentionApps, icon: AlertTriangle, variant: needsAttentionApps > 0 ? 'danger' as const : 'default' as const },
    { label: 'Rejeitados', value: rejectedApps, icon: XCircle, variant: rejectedApps > 0 ? 'danger' as const : 'default' as const },
    { label: 'Builds Pendentes', value: pendingBuilds, icon: Hourglass, variant: 'info' as const },
    { label: 'Taxa Aprovação', value: `${approvalRate}%`, icon: TrendingUp, variant: 'info' as const },
  ]

  const statusDistribution = [
    { label: 'Publicados', count: publishedApps, color: 'bg-emerald-500', pct: totalApps > 0 ? (publishedApps / totalApps) * 100 : 0 },
    { label: 'Em Revisão', count: inReviewApps, color: 'bg-amber-500', pct: totalApps > 0 ? (inReviewApps / totalApps) * 100 : 0 },
    { label: 'Rejeitados', count: rejectedApps, color: 'bg-red-500', pct: totalApps > 0 ? (rejectedApps / totalApps) * 100 : 0 },
    { label: 'Outros', count: totalApps - publishedApps - inReviewApps - rejectedApps, color: 'bg-slate-400', pct: totalApps > 0 ? ((totalApps - publishedApps - inReviewApps - rejectedApps) / totalApps) * 100 : 0 },
  ]

  const googleCount = apps.filter(a => a.playVersion && a.playVersion !== '-').length
  const appleCount = apps.filter(a => a.appVersion && a.appVersion !== '-').length

  const filteredActivity = useMemo(() =>
    activity.filter(a => !['SIGN_IN', 'SIGN_OUT'].some(s => a.action.toUpperCase().includes(s))),
  [activity])

  const timeSinceLastUpdate = useMemo(() => {
    const dates = ([activity.map(a => a.createdAt), apps.map(a => a.updatedAt || a.createdAt)].flat().filter(Boolean) as string[])
    if (!dates.length) return null
    const latest = new Date(Math.max(...dates.map(d => new Date(d).getTime())))
    const diff = Date.now() - latest.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'agora mesmo'
    if (mins < 60) return `${mins} min atrás`
    return `${Math.floor(mins / 60)}h atrás`
  }, [activity, apps])

  if (appsLoading) return <Spinner />

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalApps} {totalApps === 1 ? 'aplicativo monitorado' : 'aplicativos monitorados'}
            {inReviewApps > 0 && <span className="inline-flex items-center gap-1 ml-2">
              <Badge variant="warning" dot>{inReviewApps} em revisão</Badge>
            </span>}
            {needsAttentionApps > 0 && <span className="inline-flex items-center gap-1 ml-1.5">
              <Badge variant="danger" dot>{needsAttentionApps} precisam de atenção</Badge>
            </span>}
          </p>
          {timeSinceLastUpdate && (
            <p className="text-xs text-muted-foreground/60 mt-0.5">Última atualização há {timeSinceLastUpdate}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-foreground text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all"
          >
            <Download size={15} /> Relatórios
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map(card => (
          <Link key={card.label} href={card.label === 'Publicados' ? '/apps?status=PUBLISHED' : card.label === 'Em Revisão' ? '/apps?status=REVIEW' : card.label === 'Rejeitados' ? '/apps?status=REJECTED' : '/apps'}>
            <MetricCard
              title={card.label}
              value={card.value}
              icon={<card.icon size={16} />}
              variant={card.variant}
              subtitle={'subtitle' in card ? card.subtitle : undefined}
            />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-200 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Prioridades</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Itens que exigem ação</p>
            </div>
            <Link href="/apps" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              Ver todas as pendências <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {priorities.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground/60">
                Nenhum item pendente
              </div>
            ) : (
              priorities.map(app => {
                const status = (app.playStatus || app.appStatus || '').toUpperCase()
                const isRed = status === 'REJECTED' || status === 'FAILED'
                const isYellow = status === 'PENDING'
                const isGreen = status === 'PUBLISHED'
                return (
                  <Link
                    key={app.id}
                    href={`/apps/${app.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 hover:bg-slate-100/60 dark:hover:bg-white/[0.06] transition-all group"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isRed ? 'bg-red-500' : isYellow ? 'bg-amber-500' : isGreen ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {isRed ? 'Versão rejeitada' : isYellow ? 'Documentação pendente' : isGreen ? 'Pronto para publicação' : status}
                      </p>
                    </div>
                    <Badge variant={isRed ? 'danger' : isYellow ? 'warning' : isGreen ? 'success' : 'default'} size="sm" dot>
                      {status}
                    </Badge>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-200 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Saúde da Plataforma</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Resumo geral</p>
            </div>
            <Link href="/apps" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              <ExternalLink size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Publicados</span>
              <span className="font-medium text-foreground">{publishedApps}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Em revisão</span>
              <span className="font-medium text-foreground">{inReviewApps}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Requer atenção</span>
              <span className="font-medium text-red-500">{needsAttentionApps}</span>
            </div>
            <div className="border-t border-slate-200/60 dark:border-white/10 pt-3 mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-semibold text-foreground">{totalApps}</span>
              </div>
            </div>
          </div>
          <Link
            href="/apps"
            className="mt-4 block text-center text-sm text-blue-600 dark:text-blue-400 py-2 rounded-lg border border-slate-200/60 dark:border-white/10 hover:bg-slate-100/60 dark:hover:bg-white/[0.06] transition-all"
          >
            Ver listagem completa
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-200 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Apps Recentes</h3>
            <Link href="/apps" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              Ver todos
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <EmptyState icon={Smartphone} title="Nenhum app encontrado" description="Crie seu primeiro aplicativo para começar." action={{ label: 'Criar aplicativo', onClick: () => router.push('/apps/new') }} />
          ) : (
            <div className="space-y-2">
              {recentApps.map(app => {
                const status = (app.playStatus || app.appStatus || '').toUpperCase()
                const statusVariant = status === 'PUBLISHED' ? 'success' as const : status === 'REVIEW' ? 'warning' as const : status === 'REJECTED' ? 'danger' as const : 'neutral' as const
                return (
                  <Link
                    key={app.id}
                    href={`/apps/${app.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 hover:bg-slate-100/60 dark:hover:bg-white/[0.06] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Smartphone size={14} className="text-muted-foreground/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                        <p className="text-xs text-muted-foreground">
                          v{app.playVersion || app.appVersion || '-'} · {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString('pt-BR') : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusVariant} size="sm" dot>
                      {status}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-200 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Estatísticas</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Distribuição por status</span>
                <span className="text-xs text-muted-foreground/60">{totalApps} apps</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                {statusDistribution.filter(s => s.count > 0).map(s => (
                  <Tooltip key={s.label} content={`${s.label}: ${s.count} (${Math.round(s.pct)}%)`}>
                    <div className={s.color} style={{ width: `${s.pct}%` }} />
                  </Tooltip>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {statusDistribution.filter(s => s.count > 0).map(s => (
                  <span key={s.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full ${s.color}`} />
                    {s.label} ({s.count})
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={14} className="text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Google Play</span>
                </div>
                <p className="text-lg font-bold text-foreground">{googleCount}</p>
                <p className="text-[10px] text-muted-foreground/60">apps publicados</p>
              </div>
              <div className="p-3 rounded-lg bg-white/50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Apple size={14} className="text-blue-500" />
                  <span className="text-xs text-muted-foreground">App Store</span>
                </div>
                <p className="text-lg font-bold text-foreground">{appleCount}</p>
                <p className="text-[10px] text-muted-foreground/60">apps publicados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-200 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Timeline</h3>
          <Link href="/activity" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            Ver todas <ArrowUpRight size={12} />
          </Link>
        </div>
        {filteredActivity.length === 0 ? (
          <EmptyState icon={Activity} title="Nenhum evento" description="Atividades recentes aparecerão aqui." action={{ label: 'Ver atividade', onClick: () => router.push('/activity'), variant: 'outline' }} />
        ) : (
          <div className="space-y-0">
            {filteredActivity.slice(0, 10).map((event, idx) => {
              const action = event.action.toUpperCase()
              const Icon = action.includes('SUCCESS') || action.includes('APPROVED') ? CheckCircle :
                action.includes('REJECT') || action.includes('FAILED') ? XCircle :
                action.includes('EDIT') || action.includes('UPDATE') ? Edit :
                action.includes('CREATE') ? Plus : RefreshCw
              const iconColor = action.includes('SUCCESS') || action.includes('APPROVED') ? 'text-emerald-500' :
                action.includes('REJECT') || action.includes('FAILED') ? 'text-red-500' : 'text-blue-500'

              return (
                <div key={event.id} className="flex items-start gap-3 py-2.5 border-b border-slate-200/40 dark:border-white/5 last:border-0">
                  <div className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}>
                    <Icon size={12} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground/80 truncate">{event.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground/60">{new Date(event.createdAt).toLocaleString('pt-BR')}</span>
                      {event.username && <><span className="text-xs text-muted-foreground/30">·</span><span className="text-xs text-muted-foreground/60">{event.username}</span></>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
