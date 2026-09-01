'use client'

import { Suspense, useMemo, useEffect, useState } from 'react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/LoadingSkeleton'
import { useApps } from '@/hooks/useApps'
import { useActivity } from '@/hooks/useActivity'
import { useLang } from '@/contexts/LanguageContext'
import { overallStatus } from '@/lib/utils'
import { DashboardKPIs } from './DashboardKPIs'
import { DashboardPriorities } from './DashboardPriorities'
import { DashboardRecentStats } from './DashboardRecentStats'
import { Download, CheckCircle, XCircle, Edit, Plus, RefreshCw, Activity, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export function DashboardView() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ErrorBoundary><CommandCenter /></ErrorBoundary>
    </Suspense>
  )
}

function DashboardSkeleton() {
  const shimmer = 'rounded-xl bg-muted animate-pulse'
  return (
    <div className="space-y-8">
      <div className={`h-24 ${shimmer}`} />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className={`h-28 ${shimmer}`} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`h-80 lg:col-span-2 ${shimmer}`} />
        <div className={`h-80 ${shimmer}`} />
      </div>
    </div>
  )
}

function CommandCenter() {
  const { t, lang } = useLang()
  const { data: apps = [], isLoading: appsLoading } = useApps()
  const { data: activity = [] } = useActivity({ limit: 20 })

  const totalApps = apps.length
  const publishedApps = apps.filter(a => overallStatus(a) === 'published').length
  const inReviewApps = apps.filter(a => overallStatus(a) === 'review').length
  const rejectedApps = apps.filter(a => overallStatus(a) === 'rejected').length
  const needsAttentionApps = apps.filter(a => {
    const s = overallStatus(a)
    return s === 'rejected' || s === 'pending'
  }).length
  const pendingBuilds = apps.filter(a => {
    const s = overallStatus(a)
    return s === 'pending' || s === 'review'
  }).length
  const approvalRate = totalApps > 0 ? Math.round((publishedApps / totalApps) * 100) : 0

  const recentApps = [...apps].sort((a, b) => {
    const aDate = a.lastSyncAt || a.createdAt
    const bDate = b.lastSyncAt || b.createdAt
    return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime()
  }).slice(0, 8)

  const priorities = apps.filter(a => {
    const s = overallStatus(a)
    return s === 'rejected' || s === 'pending' || s === 'published'
  }).slice(0, 5)

  const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'ar-SA'

  const statusDistribution = [
    { label: t('dashboard.published_singular'), count: publishedApps, color: 'bg-emerald-500', pct: totalApps > 0 ? (publishedApps / totalApps) * 100 : 0 },
    { label: t('dashboard.inReview'), count: inReviewApps, color: 'bg-amber-500', pct: totalApps > 0 ? (inReviewApps / totalApps) * 100 : 0 },
    { label: t('dashboard.rejected'), count: rejectedApps, color: 'bg-red-500', pct: totalApps > 0 ? (rejectedApps / totalApps) * 100 : 0 },
    { label: t('dashboard.others'), count: totalApps - publishedApps - inReviewApps - rejectedApps, color: 'bg-slate-400', pct: totalApps > 0 ? ((totalApps - publishedApps - inReviewApps - rejectedApps) / totalApps) * 100 : 0 },
  ]

  const googleCount = apps.filter(a => a.playStore.version && a.playStore.version !== '-').length
  const appleCount = apps.filter(a => a.appStore.version && a.appStore.version !== '-').length

  const filteredActivity = useMemo(() =>
    activity.filter(a => !['SIGN_IN', 'SIGN_OUT'].some(s => a.action.toUpperCase().includes(s))),
  [activity])

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const timeSinceLastUpdate = useMemo(() => {
    const dates = ([activity.map(a => a.createdAt), apps.map(a => a.lastSyncAt || a.createdAt)].flat().filter(Boolean) as string[])
    if (!dates.length) return null
    const latest = new Date(Math.max(...dates.map(d => new Date(d).getTime()).filter(n => !isNaN(n)), 0))
    const diff = now - latest.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return t('dashboard.justNow')
    if (mins < 60) return t('dashboard.minAgo', { mins })
    return t('dashboard.hoursAgo', { hours: Math.floor(mins / 60) })
  }, [activity, apps, t, now])

  if (appsLoading) return <Spinner />

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('dashboard.monitoredApps', { count: totalApps, s: totalApps === 1 ? '' : 's' })}
            {inReviewApps > 0 && <span className="inline-flex items-center gap-1 ml-2">
              <Badge variant="warning" dot>{t('dashboard.inReview_badge', { count: inReviewApps })}</Badge>
            </span>}
            {needsAttentionApps > 0 && <span className="inline-flex items-center gap-1 ml-1.5">
              <Badge variant="danger" dot>{t('dashboard.needsAttention_badge', { count: needsAttentionApps })}</Badge>
            </span>}
          </p>
          {timeSinceLastUpdate && (
            <p className="text-xs text-muted-foreground/60 mt-0.5">{t('dashboard.lastUpdate', { time: timeSinceLastUpdate })}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="sasi-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm">
            <Download size={15} /> {t('dashboard.reports')}
          </button>
        </div>
      </div>

      <DashboardKPIs
        totalApps={totalApps}
        publishedApps={publishedApps}
        inReviewApps={inReviewApps}
        rejectedApps={rejectedApps}
        needsAttentionApps={needsAttentionApps}
        pendingBuilds={pendingBuilds}
        approvalRate={approvalRate}
      />

      <DashboardPriorities
        priorities={priorities}
        publishedApps={publishedApps}
        inReviewApps={inReviewApps}
        needsAttentionApps={needsAttentionApps}
        totalApps={totalApps}
      />

      <DashboardRecentStats
        recentApps={recentApps}
        statusDistribution={statusDistribution}
        totalApps={totalApps}
        googleCount={googleCount}
        appleCount={appleCount}
        locale={locale}
      />

      <ActivityTimeline events={filteredActivity} locale={locale} />
    </div>
  )
}

function ActivityTimeline({ events, locale }: { events: ReturnType<typeof useActivity> extends { data: infer D } ? D : never; locale: string }) {
  const { t } = useLang()

  const iconMap = (action: string) => {
    const a = action.toUpperCase()
    if (a.includes('SUCCESS') || a.includes('APPROVED')) return { Icon: CheckCircle, color: 'text-emerald-500' }
    if (a.includes('REJECT') || a.includes('FAILED')) return { Icon: XCircle, color: 'text-red-500' }
    if (a.includes('EDIT') || a.includes('UPDATE')) return { Icon: Edit, color: 'text-blue-500' }
    if (a.includes('CREATE')) return { Icon: Plus, color: 'text-blue-500' }
    return { Icon: RefreshCw, color: 'text-muted-foreground' }
  }

  const list = (events ?? []) as Array<{ id: string; action: string; description: string; username?: string | null; createdAt: string }>

  return (
    <div className="sasi-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{t('dashboard.timeline')}</h3>
        <Link href="/activity" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          {t('dashboard.viewAll')} <ArrowUpRight size={12} />
        </Link>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={Activity} title={t('dashboard.noEvents')} description={t('dashboard.noEventsDesc')} />
      ) : (
        <div className="space-y-0">
          {list.slice(0, 10).map(event => {
            const { Icon, color } = iconMap(event.action)
            return (
              <div key={event.id} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
                <div className={`w-6 h-6 rounded-full bg-surface flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                  <Icon size={12} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground/80 truncate">{event.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground/60">{new Date(event.createdAt).toLocaleString(locale)}</span>
                    {event.username && <><span className="text-xs text-muted-foreground/30">·</span><span className="text-xs text-muted-foreground/60">{event.username}</span></>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}