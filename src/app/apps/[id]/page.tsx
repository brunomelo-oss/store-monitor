'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAppDetail } from '@/features/apps/hooks/useAppDetail'
import { useSyncHistory } from '@/features/sync/hooks/useSyncHistory'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useActivity } from '@/features/activity/hooks/useActivity'
import { auditLogService } from '@/services/audit-logs.service'
import { PageSkeleton } from '@/components/LoadingSkeleton'
import { ErrorState } from '@/components/ErrorState'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Globe, Apple, Smartphone, Package, Layers, GitBranch, BarChart3, Star, MessageSquare, RefreshCw, Bell, FileText, Clock, AlertTriangle, CheckCircle, XCircle, ExternalLink, Copy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { OverviewTab } from '@/features/apps/components/tabs/OverviewTab'
import { GooglePlayTab } from '@/features/apps/components/tabs/GooglePlayTab'
import { AppStoreTab } from '@/features/apps/components/tabs/AppStoreTab'
import { VersionsTab } from '@/features/apps/components/tabs/VersionsTab'
import { BuildsTab } from '@/features/apps/components/tabs/BuildsTab'
import { ReleasesTab } from '@/features/apps/components/tabs/ReleasesTab'
import { TracksTab } from '@/features/apps/components/tabs/TracksTab'
import { AnalyticsTab } from '@/features/apps/components/tabs/AnalyticsTab'
import { RatingsTab } from '@/features/apps/components/tabs/RatingsTab'
import { ReviewsTab } from '@/features/apps/components/tabs/ReviewsTab'
import { SyncTab } from '@/features/apps/components/tabs/SyncTab'
import { NotificationsTab } from '@/features/apps/components/tabs/NotificationsTab'
import { AuditTab } from '@/features/apps/components/tabs/AuditTab'
import { TimelineTab } from '@/features/apps/components/tabs/TimelineTab'
import type { TimelineEvent } from '@/components/Timeline'

const tabs = [
  { id: 'overview', label: 'Overview', icon: Smartphone },
  { id: 'google', label: 'Google Play', icon: Globe },
  { id: 'apple', label: 'App Store', icon: Apple },
  { id: 'versions', label: 'Versions', icon: Package },
  { id: 'builds', label: 'Builds', icon: Layers },
  { id: 'releases', label: 'Releases', icon: GitBranch },
  { id: 'tracks', label: 'Tracks', icon: GitBranch },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'ratings', label: 'Ratings', icon: Star },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'sync', label: 'Sync History', icon: RefreshCw },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'audit', label: 'Audit Log', icon: FileText },
  { id: 'timeline', label: 'Timeline', icon: Clock },
]

export default function AppDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const appId = Number(params.id)
  const { data: app, isLoading, error, refetch } = useAppDetail(appId)
  const { data: syncHistory } = useSyncHistory(appId)
  const { data: notifications } = useNotifications(50, appId)
  const { data: activity } = useActivity(50, { entity: 'app', entityId: appId })
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState('')

  const auditLogQuery = useQuery({
    queryKey: ['audit-logs', 'app', appId],
    queryFn: () => auditLogService.list({ entity: 'app', entityId: appId, take: 50 }),
    enabled: activeTab === 'audit' || activeTab === 'timeline',
  })

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState onRetry={() => refetch()} />

  if (!app) {
    return (
      <AppLayout>
        <EmptyState icon={AlertTriangle} title="App não encontrado" description="O aplicativo solicitado não foi encontrado" />
      </AppLayout>
    )
  }

  const appAuditLogs = (auditLogQuery.data || []).filter(l => l.entity === 'app' && l.entityId === appId)
  const timelineEvents: TimelineEvent[] = [
    ...(activity || []).map(a => ({ ...a, timestamp: a.createdAt })),
    ...appAuditLogs.map(l => ({
      id: `audit-${l.id}`,
      type: 'audit_log' as const,
      description: l.action,
      metadata: l.metadata,
      username: l.user?.username || null,
      timestamp: l.createdAt,
    })),
    ...(syncHistory || []).map(s => ({
      id: `sync-${s.id}`,
      type: 'sync' as const,
      description: `Sincronização ${s.type} — ${s.status}`,
      metadata: { store: s.store, triggerType: s.triggerType },
      username: null,
      timestamp: s.startedAt,
    })),
    ...(notifications || []).map(n => ({
      id: `notif-${n.id}`,
      type: 'notification' as const,
      description: n.title,
      metadata: null,
      username: null,
      timestamp: n.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(''), 1500) }

  const overallStatus = app.playStatus === 'PUBLISHED' || app.appStatus === 'PUBLISHED' ? 'PUBLISHED'
    : app.playStatus === 'REJECTED' || app.appStatus === 'REJECTED' ? 'REJECTED'
    : app.playStatus === 'REVIEW' || app.appStatus === 'REVIEW' ? 'IN_REVIEW'
    : 'DRAFT'

  return (
    <AuthGuard>
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/apps" className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{app.name}</h1>
              <StatusBadge status={overallStatus} size="md" />
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span>{app.packageName || app.bundleId || '—'}</span>
              <span>·</span>
              <span>{app.region === 'BRASIL' ? 'Brasil' : 'Internacional'}</span>
              {app.storeConnection && (
                <><span>·</span><span>Conectado</span></>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => copy(app.packageName || app.bundleId || '')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted/50 transition-colors">
              {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copiado' : (app.packageName ? 'Package Name' : 'Bundle ID')}
            </button>
            {app.packageName && (
              <a href={`https://play.google.com/store/apps/details?id=${app.packageName}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted/50 transition-colors">
                <ExternalLink size={14} /> Google Play
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2 border-b sticky top-14 bg-background z-30 -mx-4 sm:mx-0 px-4 sm:px-0">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap rounded-t-lg transition-colors shrink-0 ${activeTab === tab.id ? 'bg-muted/50 border-b-2 border-primary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {activeTab === 'overview' && <OverviewTab app={app} syncHistory={syncHistory || []} />}
        {activeTab === 'google' && <GooglePlayTab app={app} />}
        {activeTab === 'apple' && <AppStoreTab app={app} />}
        {activeTab === 'versions' && <VersionsTab app={app} />}
        {activeTab === 'builds' && <BuildsTab app={app} />}
        {activeTab === 'releases' && <ReleasesTab app={app} />}
        {activeTab === 'tracks' && <TracksTab app={app} />}
        {activeTab === 'analytics' && <AnalyticsTab app={app} />}
        {activeTab === 'ratings' && <RatingsTab app={app} />}
        {activeTab === 'reviews' && <ReviewsTab app={app} />}
        {activeTab === 'sync' && <SyncTab appId={appId} />}
        {activeTab === 'notifications' && <NotificationsTab appId={appId} />}
        {activeTab === 'audit' && <AuditTab auditLogs={appAuditLogs} />}
        {activeTab === 'timeline' && <TimelineTab events={timelineEvents} />}
      </div>
    </AppLayout>
    </AuthGuard>
  )
}
