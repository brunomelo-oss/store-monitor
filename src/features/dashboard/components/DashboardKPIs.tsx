'use client'

import { MetricCard } from '@/components/MetricCard'
import { useLang } from '@/contexts/LanguageContext'
import { Smartphone, Clock, AlertTriangle, XCircle, Hourglass, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface DashboardKPIsProps {
  totalApps: number
  publishedApps: number
  inReviewApps: number
  rejectedApps: number
  needsAttentionApps: number
  pendingBuilds: number
  approvalRate: number
}

export function DashboardKPIs({ totalApps, publishedApps, inReviewApps, rejectedApps, needsAttentionApps, pendingBuilds, approvalRate }: DashboardKPIsProps) {
  const { t } = useLang()

  const kpiCards = [
    { label: t('dashboard.published'), value: publishedApps, icon: Smartphone, variant: 'success' as const, subtitle: t('dashboard.ofTotal', { count: totalApps }) },
    { label: t('dashboard.inReview'), value: inReviewApps, icon: Clock, variant: 'warning' as const },
    { label: t('dashboard.needsAttention'), value: needsAttentionApps, icon: AlertTriangle, variant: 'attention' as const },
    { label: t('dashboard.rejected'), value: rejectedApps, icon: XCircle, variant: 'rejected' as const },
    { label: t('dashboard.pendingBuilds'), value: pendingBuilds, icon: Hourglass, variant: 'pending' as const },
    { label: t('dashboard.approvalRate'), value: `${approvalRate}%`, icon: TrendingUp, variant: 'rate' as const },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {kpiCards.map(card => (
        <Link key={card.label} href={card.label === t('dashboard.published') ? '/apps?status=PUBLISHED' : card.label === t('dashboard.inReview') ? '/apps?status=REVIEW' : card.label === t('dashboard.rejected') ? '/apps?status=REJECTED' : '/apps'}>
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
  )
}
