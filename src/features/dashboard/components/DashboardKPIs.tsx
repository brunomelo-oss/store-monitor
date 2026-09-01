'use client'

import { MetricCard } from '@/components/ui/MetricCard'
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
    { label: t('dashboard.published'), value: publishedApps, icon: <Smartphone size={16} />, variant: 'success' as const, subtitle: t('dashboard.ofTotal', { count: totalApps }) },
    { label: t('dashboard.inReview'), value: inReviewApps, icon: <Clock size={16} />, variant: 'warning' as const },
    { label: t('dashboard.needsAttention'), value: needsAttentionApps, icon: <AlertTriangle size={16} />, variant: 'danger' as const },
    { label: t('dashboard.rejected'), value: rejectedApps, icon: <XCircle size={16} />, variant: 'danger' as const },
    { label: t('dashboard.pendingBuilds'), value: pendingBuilds, icon: <Hourglass size={16} />, variant: 'warning' as const },
    { label: t('dashboard.approvalRate'), value: `${approvalRate}%`, icon: <TrendingUp size={16} />, variant: 'default' as const },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {kpiCards.map(card => (
        <Link key={card.label} href={`/apps?status=${card.variant === 'success' ? 'published' : card.variant === 'warning' ? 'review' : card.variant === 'danger' ? 'rejected' : ''}`}>
          <MetricCard label={card.label} value={card.value} icon={card.icon} variant={card.variant} subtitle={card.subtitle} />
        </Link>
      ))}
    </div>
  )
}