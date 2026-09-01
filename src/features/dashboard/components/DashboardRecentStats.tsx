'use client'

import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { EmptyState } from '@/components/ui/EmptyState'
import { useLang } from '@/contexts/LanguageContext'
import { appIcon, latestVersion, overallStatus } from '@/lib/utils'
import type { App } from '@/lib/types'
import { Smartphone, Globe, Apple } from 'lucide-react'
import Link from 'next/link'

interface DashboardRecentStatsProps {
  recentApps: App[]
  statusDistribution: { label: string; count: number; color: string; pct: number }[]
  totalApps: number
  googleCount: number
  appleCount: number
  locale: string
}

export function DashboardRecentStats({ recentApps, statusDistribution, totalApps, googleCount, appleCount, locale }: DashboardRecentStatsProps) {
  const { t } = useLang()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="sasi-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{t('dashboard.recentApps')}</h3>
          <Link href="/apps" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            {t('dashboard.viewAll')}
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <EmptyState icon={Smartphone} title={t('dashboard.noAppsFound')} description={t('dashboard.createFirstApp')} />
        ) : (
          <div className="space-y-2">
            {recentApps.map(app => {
              const status = overallStatus(app)
              const statusVariant = status === 'published' ? 'success' as const : status === 'review' ? 'warning' as const : status === 'rejected' ? 'danger' as const : 'neutral' as const
              return (
                <Link key={app.id} href={`/apps/${app.id}`} className="flex items-center justify-between p-3 rounded-lg sasi-card transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0 overflow-hidden">
                      {appIcon(app) ? <img src={appIcon(app)} alt="" className="w-full h-full object-cover" /> : <Smartphone size={14} className="text-muted-foreground/60" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                      <p className="text-xs text-muted-foreground">
                        v{latestVersion(app)} · {app.lastSyncAt ? new Date(app.lastSyncAt).toLocaleDateString(locale) : ''}
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

      <div className="sasi-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{t('dashboard.statistics')}</h3>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('dashboard.statusDistribution')}</span>
              <span className="text-xs text-muted-foreground/60">{t('dashboard.apps', { count: totalApps })}</span>
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
            <div className="p-3 rounded-lg sasi-card">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-emerald-500" />
                <span className="text-xs text-muted-foreground">Google Play</span>
              </div>
              <p className="text-lg font-bold text-foreground">{googleCount}</p>
              <p className="text-[10px] text-muted-foreground/60">{t('dashboard.publishedApps')}</p>
            </div>
            <div className="p-3 rounded-lg sasi-card">
              <div className="flex items-center gap-2 mb-2">
                <Apple size={14} className="text-blue-500" />
                <span className="text-xs text-muted-foreground">App Store</span>
              </div>
              <p className="text-lg font-bold text-foreground">{appleCount}</p>
              <p className="text-[10px] text-muted-foreground/60">{t('dashboard.publishedApps')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}