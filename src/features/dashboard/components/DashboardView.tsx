'use client'

import { Suspense, useMemo } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { Spinner } from '@/components/LoadingSkeleton'
import { useApps } from '@/hooks/useApps'
import { useActivity } from '@/features/activity/hooks/useActivity'
import { useLang } from '@/contexts/LanguageContext'
import { DashboardKPIs } from './DashboardKPIs'
import { DashboardPriorities } from './DashboardPriorities'
import { DashboardRecentStats } from './DashboardRecentStats'
import { Download, CheckCircle, XCircle, Edit, Plus, RefreshCw, Activity, ArrowUpRight } from 'lucide-react'
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
  const { t, lang } = useLang()
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
    return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime()
  }).slice(0, 8)

  const priorities = apps.filter(a => {
    const s = (a.playStatus || a.appStatus || '').toUpperCase()
    return s === 'REJECTED' || s === 'PENDING' || s === 'FAILED' || s === 'PUBLISHED'
  }).slice(0, 5)

  const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'ar-SA'

  const statusDistribution = [
    { label: t('dashboard.published_singular'), count: publishedApps, color: 'bg-emerald-500', pct: totalApps > 0 ? (publishedApps / totalApps) * 100 : 0 },
    { label: t('dashboard.inReview'), count: inReviewApps, color: 'bg-amber-500', pct: totalApps > 0 ? (inReviewApps / totalApps) * 100 : 0 },
    { label: t('dashboard.rejected'), count: rejectedApps, color: 'bg-red-500', pct: totalApps > 0 ? (rejectedApps / totalApps) * 100 : 0 },
    { label: t('dashboard.others'), count: totalApps - publishedApps - inReviewApps - rejectedApps, color: 'bg-slate-400', pct: totalApps > 0 ? ((totalApps - publishedApps - inReviewApps - rejectedApps) / totalApps) * 100 : 0 },
  ]

  const googleCount = apps.filter(a => a.playVersion && a.playVersion !== '-').length
  const appleCount = apps.filter(a => a.appVersion && a.appVersion !== '-').length

  const filteredActivity = useMemo(() =>
    activity.filter(a => !['SIGN_IN', 'SIGN_OUT'].some(s => a.action.toUpperCase().includes(s))),
  [activity])

  const timeSinceLastUpdate = useMemo(() => {
    const dates = ([activity.map(a => a.createdAt), apps.map(a => a.updatedAt || a.createdAt)].flat().filter(Boolean) as string[])
    if (!dates.length) return null
    const latest = new Date(Math.max(...dates.map(d => new Date(d).getTime()).filter(n => !isNaN(n)), 0))
    const diff = Date.now() - latest.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return t('dashboard.justNow')
    if (mins < 60) return t('dashboard.minAgo', { mins })
    return t('dashboard.hoursAgo', { hours: Math.floor(mins / 60) })
  }, [activity, apps, t])

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

      <div className="sasi-card-hover rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{t('dashboard.timeline')}</h3>
          <Link href="/activity" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            {t('dashboard.viewAll')} <ArrowUpRight size={12} />
          </Link>
        </div>
        {filteredActivity.length === 0 ? (
          <EmptyState icon={Activity} title={t('dashboard.noEvents')} description={t('dashboard.noEventsDesc')} action={{ label: t('dashboard.viewActivity'), onClick: () => router.push('/activity'), variant: 'outline' }} />
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
                <div key={event.id} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
                  <div className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}>
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
    </div>
  )
}
