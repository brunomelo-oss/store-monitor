'use client'

import { Badge } from '@/components/Badge'
import { useLang } from '@/contexts/LanguageContext'
import type { App } from '@/types'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface DashboardPrioritiesProps {
  priorities: App[]
  publishedApps: number
  inReviewApps: number
  needsAttentionApps: number
  totalApps: number
}

export function DashboardPriorities({ priorities, publishedApps, inReviewApps, needsAttentionApps, totalApps }: DashboardPrioritiesProps) {
  const { t } = useLang()

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 sasi-card-hover rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{t('dashboard.priorities')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.requiresAction')}</p>
          </div>
          <Link href="/apps" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            {t('dashboard.viewAllPending')} <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {priorities.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground/60">
              {t('dashboard.noPendingItems')}
            </div>
          ) : (
            priorities.map(app => {
              const status = (app.playStatus || app.appStatus || '').toUpperCase()
              const isRed = status === 'REJECTED' || status === 'FAILED'
              const isYellow = status === 'PENDING'
              const isGreen = status === 'PUBLISHED'
              return (
                <Link key={app.id} href={`/apps/${app.id}`} className="flex items-center gap-4 p-3 rounded-lg sasi-card transition-all group">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isRed ? 'bg-red-500' : isYellow ? 'bg-amber-500' : isGreen ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {isRed ? t('dashboard.rejectedVersion') : isYellow ? t('dashboard.pendingDocumentation') : isGreen ? t('dashboard.readyToPublish') : status}
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

      <div className="sasi-card-hover rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{t('dashboard.platformHealth')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.generalSummary')}</p>
          </div>
          <Link href="/apps" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            <ExternalLink size={13} />
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('dashboard.published_singular')}</span>
            <span className="font-medium text-foreground">{publishedApps}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('dashboard.inReview')}</span>
            <span className="font-medium text-foreground">{inReviewApps}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('dashboard.requiresAttention')}</span>
            <span className="font-medium text-red-500">{needsAttentionApps}</span>
          </div>
          <div className="border-t border-border pt-3 mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">{t('dashboard.total')}</span>
              <span className="font-semibold text-foreground">{totalApps}</span>
            </div>
          </div>
        </div>
        <Link href="/apps" className="sasi-btn-secondary mt-4 block text-center text-sm py-2 rounded-lg">
          {t('dashboard.viewFullList')}
        </Link>
      </div>
    </div>
  )
}
