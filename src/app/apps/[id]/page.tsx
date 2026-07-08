'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { useAppDetail } from '@/features/apps/hooks/useAppDetail'
import { useSyncHistory } from '@/features/sync/hooks/useSyncHistory'
import { useTriggerSync } from '@/features/sync/hooks/useTriggerSync'
import { auditLogService, type AuditLogItem } from '@/services/audit-logs.service'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useActivity } from '@/features/activity/hooks/useActivity'
import { PageSkeleton, Spinner } from '@/components/LoadingSkeleton'
import { ErrorState } from '@/components/ErrorState'
import { StatusBadge } from '@/components/StatusBadge'
import { MetricCard } from '@/components/MetricCard'
import { Timeline } from '@/components/Timeline'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Globe, Apple, Smartphone, Package, Layers, GitBranch, BarChart3, Star, MessageSquare, RefreshCw, Bell, FileText, Clock, AlertTriangle, CheckCircle, XCircle, ExternalLink, Copy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
  const { user, loading } = useAuth()
  const router = useRouter()
  const appId = Number(params.id)
  const { data: app, isLoading, error, refetch } = useAppDetail(appId)
  const { data: syncHistory } = useSyncHistory()
  const { data: notifications } = useNotifications(50)
  const { data: activity } = useActivity(50)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState('')

  const auditLogQuery = useQuery({
    queryKey: ['audit-logs', 'app', appId],
    queryFn: () => auditLogService.list({ entity: 'app', entityId: appId, take: 50 }),
    enabled: activeTab === 'audit',
  })

  if (loading || !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Spinner /></div>
  }

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState onRetry={() => refetch()} />

  if (!app) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <EmptyState icon={AlertTriangle} title="App não encontrado" description="O aplicativo solicitado não foi encontrado" />
        </main>
      </div>
    )
  }

  const appSyncHistory = (syncHistory || []).filter(s => s.appId === appId)
  const appNotifications = (notifications || []).filter(n => n.appId === appId)
  const appAuditLogs = (auditLogQuery.data || []).filter(l => l.entity === 'app' && l.entityId === appId)
  const timelineEvents = [
    ...(activity || []).filter(a => a.entity === 'app' || a.entityId === appId),
    ...appAuditLogs.map(l => ({
      id: `audit-${l.id}`,
      type: 'audit_log' as const,
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      description: l.action,
      metadata: l.metadata,
      userId: l.userId,
      username: l.user?.username || null,
      createdAt: l.createdAt,
    })),
    ...appSyncHistory.map(s => ({
      id: `sync-${s.id}`,
      type: 'sync' as const,
      action: `sync.${s.status.toLowerCase()}`,
      entity: 'sync_history',
      entityId: s.id,
      description: `Sincronização ${s.type} — ${s.status}`,
      metadata: { store: s.store, triggerType: s.triggerType },
      userId: null,
      username: null,
      createdAt: s.startedAt,
    })),
    ...appNotifications.map(n => ({
      id: `notif-${n.id}`,
      type: 'notification' as const,
      action: `notification.${n.type.toLowerCase()}`,
      entity: 'notification',
      entityId: n.id,
      description: n.title,
      metadata: null,
      userId: null,
      username: null,
      createdAt: n.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(''), 1500) }

  const overallStatus = app.playStatus === 'PUBLISHED' || app.appStatus === 'PUBLISHED' ? 'PUBLISHED'
    : app.playStatus === 'REJECTED' || app.appStatus === 'REJECTED' ? 'REJECTED'
    : app.playStatus === 'REVIEW' || app.appStatus === 'REVIEW' ? 'IN_REVIEW'
    : 'DRAFT'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
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

        <div className="flex gap-1 overflow-x-auto pb-2 border-b">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap rounded-t-lg transition-colors ${activeTab === tab.id ? 'bg-muted/50 border-b-2 border-primary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'overview' && <OverviewTab app={app} syncHistory={appSyncHistory} />}
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
      </main>
    </div>
  )
}

function OverviewTab({ app, syncHistory }: { app: any; syncHistory: any[] }) {
  const lastSync = syncHistory[0]
  const successSyncs = syncHistory.filter(s => s.status === 'SUCCESS').length
  const failedSyncs = syncHistory.filter(s => s.status === 'FAILED').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Status" value={app.playStatus === 'PUBLISHED' || app.appStatus === 'PUBLISHED' ? 'Published' : app.playStatus === 'REJECTED' || app.appStatus === 'REJECTED' ? 'Rejected' : 'In Review'} variant={app.playStatus === 'PUBLISHED' || app.appStatus === 'PUBLISHED' ? 'success' : app.playStatus === 'REJECTED' || app.appStatus === 'REJECTED' ? 'danger' : 'warning'} icon={<Smartphone size={16} />} />
        <MetricCard title="Rating" value={app.rating ? `${app.rating.toFixed(1)}` : '—'} subtitle={app.rating ? 'de 5.0' : undefined} icon={<Star size={16} />} />
        <MetricCard title="Instalações" value={app.installations?.toLocaleString() || '—'} icon={<Smartphone size={16} />} />
        <MetricCard title="Sincronizações" value={`${successSyncs}/${syncHistory.length}`} subtitle={lastSync ? `Última: ${new Date(lastSync.startedAt).toLocaleDateString('pt-BR')}` : 'Nunca'} icon={<RefreshCw size={16} />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Globe size={16} /> Google Play</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={app.playStatus || '—'} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span>{app.playVersion || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Conta</span><span>{app.googleAccount || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Package</span><span className="font-mono text-xs">{app.packageName || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Última atualização</span><span>{app.playLastUpdate ? new Date(app.playLastUpdate).toLocaleDateString('pt-BR') : '—'}</span></div>
          </div>
        </div>
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Apple size={16} /> App Store</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={app.appStatus || '—'} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span>{app.appVersion || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Conta</span><span>{app.appleAccount || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Bundle ID</span><span className="font-mono text-xs">{app.bundleId || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Última atualização</span><span>{app.appLastUpdate ? new Date(app.appLastUpdate).toLocaleDateString('pt-BR') : '—'}</span></div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Resumo de Sincronizações</h3>
        <DataTable
          columns={[
            { key: 'status', header: 'Status', render: (s: any) => <StatusBadge status={s.status} /> },
            { key: 'type', header: 'Tipo', render: (s: any) => s.type },
            { key: 'triggerType', header: 'Disparo', render: (s: any) => s.triggerType },
            { key: 'changesDetected', header: 'Alterações', render: (s: any) => s.changesDetected || 0 },
            { key: 'startedAt', header: 'Data', render: (s: any) => new Date(s.startedAt).toLocaleString('pt-BR') },
          ]}
          data={syncHistory.slice(0, 10)}
          keyExtractor={(s: any) => s.id}
        />
      </div>
    </div>
  )
}

function GooglePlayTab({ app }: { app: any }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">Informações</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Package Name</span><span className="font-mono">{app.packageName || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={app.playStatus || '—'} size="md" /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Versão</span><span>{app.playVersion || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Conta</span><span>{app.googleAccount || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Última atualização</span><span>{app.playLastUpdate ? new Date(app.playLastUpdate).toLocaleString('pt-BR') : '—'}</span></div>
          </div>
        </div>
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">Store Connection</h3>
          {app.storeConnection ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Conexão</span><span>{app.storeConnection.label || `#${app.storeConnectionId}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ativa</span><span>{app.storeConnection.isActive ? <CheckCircle size={14} className="text-green-500 inline" /> : <XCircle size={14} className="text-red-500 inline" />}</span></div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma conexão configurada</p>
          )}
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Versões</h3>
        <DataTable
          columns={[
            { key: 'version', header: 'Versão', render: (v: any) => v.version || v.versionId },
            { key: 'status', header: 'Status', render: (v: any) => <StatusBadge status={v.status || '—'} /> },
            { key: 'buildNumber', header: 'Build', render: (v: any) => v.buildNumber || '—' },
            { key: 'createdAt', header: 'Criado em', render: (v: any) => v.createdAt ? new Date(v.createdAt).toLocaleDateString('pt-BR') : '—' },
          ]}
          data={app.versions?.filter((v: any) => v.store === 'GOOGLE') || []}
          keyExtractor={(v: any) => v.id}
          emptyMessage="Nenhuma versão encontrada"
        />
      </div>
    </div>
  )
}

function AppStoreTab({ app }: { app: any }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">Informações</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Bundle ID</span><span className="font-mono">{app.bundleId || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={app.appStatus || '—'} size="md" /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Versão</span><span>{app.appVersion || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Conta</span><span>{app.appleAccount || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Última atualização</span><span>{app.appLastUpdate ? new Date(app.appLastUpdate).toLocaleString('pt-BR') : '—'}</span></div>
          </div>
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Versões</h3>
        <DataTable
          columns={[
            { key: 'version', header: 'Versão', render: (v: any) => v.version || v.versionId },
            { key: 'status', header: 'Status', render: (v: any) => <StatusBadge status={v.status || '—'} /> },
            { key: 'buildNumber', header: 'Build', render: (v: any) => v.buildNumber || '—' },
            { key: 'createdAt', header: 'Criado em', render: (v: any) => v.createdAt ? new Date(v.createdAt).toLocaleDateString('pt-BR') : '—' },
          ]}
          data={app.versions?.filter((v: any) => v.store === 'APPLE') || []}
          keyExtractor={(v: any) => v.id}
          emptyMessage="Nenhuma versão encontrada"
        />
      </div>
    </div>
  )
}

function VersionsTab({ app }: { app: any }) {
  const versions = app.versions || []
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard title="Total" value={versions.length} icon={<Package size={16} />} />
        <MetricCard title="Publicadas" value={versions.filter((v: any) => v.status === 'PUBLISHED').length} variant="success" icon={<CheckCircle size={16} />} />
      </div>
      <DataTable
        columns={[
          { key: 'version', header: 'Versão', render: (v: any) => <span className="font-medium">{v.version || v.versionId}</span> },
          { key: 'store', header: 'Loja', render: (v: any) => v.store === 'GOOGLE' ? <span className="flex items-center gap-1"><Globe size={12} />Google Play</span> : <span className="flex items-center gap-1"><Apple size={12} />App Store</span> },
          { key: 'status', header: 'Status', render: (v: any) => <StatusBadge status={v.status} /> },
          { key: 'buildNumber', header: 'Build', render: (v: any) => v.buildNumber || '—' },
          { key: 'createdAt', header: 'Criado em', render: (v: any) => new Date(v.createdAt).toLocaleString('pt-BR') },
        ]}
        data={versions}
        keyExtractor={(v: any) => v.id}
        emptyMessage="Nenhuma versão registrada"
      />
    </div>
  )
}

function BuildsTab({ app }: { app: any }) {
  const builds = app.builds || []
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'buildNumber', header: 'Build', render: (b: any) => <span className="font-mono">{b.buildNumber}</span> },
          { key: 'store', header: 'Loja', render: (b: any) => b.store === 'GOOGLE' ? 'Google Play' : 'App Store' },
          { key: 'status', header: 'Status', render: (b: any) => <StatusBadge status={b.status} /> },
          { key: 'createdAt', header: 'Criado em', render: (b: any) => new Date(b.createdAt).toLocaleString('pt-BR') },
          { key: 'artifactUrl', header: '', render: (b: any) => b.artifactUrl ? <a href={b.artifactUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs"><ExternalLink size={14} /></a> : '—' },
        ]}
        data={builds}
        keyExtractor={(b: any) => b.id}
        emptyMessage="Nenhum build encontrado"
      />
    </div>
  )
}

function ReleasesTab({ app }: { app: any }) {
  const releases = app.releases || app.publications || []
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'store', header: 'Loja', render: (r: any) => r.store === 'GOOGLE' ? 'Google Play' : 'App Store' },
          { key: 'submittedAt', header: 'Submetido', render: (r: any) => r.submittedAt ? new Date(r.submittedAt).toLocaleString('pt-BR') : '—' },
          { key: 'publishedAt', header: 'Publicado', render: (r: any) => r.publishedAt ? new Date(r.publishedAt).toLocaleString('pt-BR') : '—' },
          { key: 'rejectionReason', header: 'Motivo rejeição', render: (r: any) => r.rejectionReason || '—', className: 'text-red-500 max-w-[200px] truncate' },
        ]}
        data={releases}
        keyExtractor={(r: any) => r.id}
        emptyMessage="Nenhum release encontrado"
      />
    </div>
  )
}

function TracksTab({ app }: { app: any }) {
  const tracks = app.tracks || []
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'name', header: 'Track', render: (t: any) => <span className="font-medium">{t.name}</span> },
          { key: 'fraction', header: 'Frações', render: (t: any) => t.fraction || '100%' },
        ]}
        data={tracks}
        keyExtractor={(t: any) => t.id}
        emptyMessage="Nenhum track encontrado"
      />
    </div>
  )
}

function AnalyticsTab({ app }: { app: any }) {
  const analytics = app.analytics || []
  const chartData = analytics.slice(0, 30).reverse()

  return (
    <div className="space-y-6">
      {chartData.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard title="Downloads" value={chartData.reduce((s: number, a: any) => s + (a.downloads || 0), 0).toLocaleString()} icon={<BarChart3 size={16} />} />
            <MetricCard title="Instalações" value={chartData.reduce((s: number, a: any) => s + (a.installs || 0), 0).toLocaleString()} icon={<Smartphone size={16} />} />
            <MetricCard title="Page Views" value={chartData.reduce((s: number, a: any) => s + (a.pageViews || 0), 0).toLocaleString()} icon={<BarChart3 size={16} />} />
            <MetricCard title="Crashses" value={chartData.reduce((s: number, a: any) => s + (a.crashes || 0), 0).toLocaleString()} variant={chartData.some((a: any) => a.crashes > 0) ? 'warning' : 'default'} icon={<AlertTriangle size={16} />} />
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Downloads nos últimos 30 dias</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickFormatter={(v: string) => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="downloads" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="installs" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <EmptyState icon={BarChart3} title="Sem dados analíticos" description="Nenhum dado de analytics disponível para este aplicativo" />
      )}
    </div>
  )
}

function RatingsTab({ app }: { app: any }) {
  const ratings = app.ratings || []
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard title="Rating Atual" value={app.rating ? `${app.rating.toFixed(1)} / 5.0` : '—'} icon={<Star size={16} />} />
        <MetricCard title="Total de Avaliações" value={ratings.length} icon={<Star size={16} />} />
      </div>
      <DataTable
        columns={[
          { key: 'score', header: 'Nota', render: (r: any) => <span className="text-yellow-400">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span> },
          { key: 'count', header: 'Quantidade', render: (r: any) => r.count || 1 },
          { key: 'date', header: 'Data', render: (r: any) => r.date ? new Date(r.date).toLocaleDateString('pt-BR') : '—' },
        ]}
        data={ratings}
        keyExtractor={(r: any) => r.id}
        emptyMessage="Nenhuma avaliação registrada"
      />
    </div>
  )
}

function ReviewsTab({ app }: { app: any }) {
  const reviews = app.reviews || []
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'author', header: 'Autor', render: (r: any) => <span className="font-medium">{r.author}</span> },
          { key: 'score', header: 'Nota', render: (r: any) => <span className="text-yellow-400">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span> },
          { key: 'title', header: 'Título', render: (r: any) => r.title || '—', className: 'max-w-[200px] truncate' },
          { key: 'content', header: 'Conteúdo', render: (r: any) => r.content ? <span className="max-w-[300px] truncate block">{r.content}</span> : '—' },
          { key: 'createdAt', header: 'Data', render: (r: any) => new Date(r.createdAt).toLocaleDateString('pt-BR') },
        ]}
        data={reviews}
        keyExtractor={(r: any) => r.id}
        emptyMessage="Nenhum review encontrado"
      />
    </div>
  )
}

function SyncTab({ appId }: { appId: number }) {
  const { data: syncHistory, isLoading } = useSyncHistory()
  const triggerSync = useTriggerSync()
  const appSyncs = (syncHistory || []).filter(s => s.appId === appId)

  if (isLoading) return <Spinner />
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            triggerSync.mutate({ appId, store: 'GOOGLE', types: ['APP_INFO', 'VERSIONS', 'BUILDS', 'REVIEWS', 'RATINGS', 'ANALYTICS', 'PUBLICATIONS'] })
            triggerSync.mutate({ appId, store: 'APPLE', types: ['APP_INFO', 'VERSIONS', 'BUILDS', 'REVIEWS', 'RATINGS', 'ANALYTICS', 'PUBLICATIONS'] })
          }}
          disabled={triggerSync.isPending}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition disabled:opacity-40"
        >
          <RefreshCw size={14} className={triggerSync.isPending ? 'animate-spin' : ''} />
          Sincronizar agora
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'status', header: 'Status', render: (s: any) => <StatusBadge status={s.status} /> },
          { key: 'type', header: 'Tipo', render: (s: any) => s.type },
          { key: 'store', header: 'Loja', render: (s: any) => s.store === 'GOOGLE' ? <span className="flex items-center gap-1"><Globe size={12} />Google</span> : <span className="flex items-center gap-1"><Apple size={12} />Apple</span> },
          { key: 'triggerType', header: 'Disparo', render: (s: any) => s.triggerType },
          { key: 'changesDetected', header: 'Alterações', render: (s: any) => s.changesDetected || 0 },
          { key: 'startedAt', header: 'Data', render: (s: any) => new Date(s.startedAt).toLocaleString('pt-BR') },
        ]}
        data={appSyncs}
        keyExtractor={(s: any) => s.id}
        emptyMessage="Nenhuma sincronização encontrada para este app"
      />
    </div>
  )
}

function NotificationsTab({ appId }: { appId: number }) {
  const { data: notifications, isLoading } = useNotifications(50)
  const appNotifs = (notifications || []).filter(n => n.appId === appId)

  if (isLoading) return <Spinner />
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'type', header: 'Tipo', render: (n: any) => <StatusBadge status={n.type} /> },
          { key: 'title', header: 'Título', render: (n: any) => <span className="font-medium">{n.title}</span> },
          { key: 'message', header: 'Mensagem', render: (n: any) => n.message, className: 'max-w-[300px] truncate' },
          { key: 'read', header: 'Lida', render: (n: any) => n.read ? <CheckCircle size={14} className="text-green-500" /> : <Clock size={14} className="text-yellow-500" /> },
          { key: 'createdAt', header: 'Data', render: (n: any) => new Date(n.createdAt).toLocaleString('pt-BR') },
        ]}
        data={appNotifs}
        keyExtractor={(n: any) => n.id}
        emptyMessage="Nenhuma notificação para este app"
      />
    </div>
  )
}

function AuditTab({ auditLogs }: { auditLogs: AuditLogItem[] }) {
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'action', header: 'Ação', render: (l: any) => <span className="font-medium">{l.action}</span> },
          { key: 'user', header: 'Usuário', render: (l: any) => l.user?.username || l.userId || '—' },
          { key: 'metadata', header: 'Detalhes', render: (l: any) => l.metadata ? JSON.stringify(l.metadata).slice(0, 80) : '—', className: 'max-w-[200px] truncate text-muted-foreground font-mono text-xs' },
          { key: 'ip', header: 'IP', render: (l: any) => l.ip || '—', className: 'font-mono text-xs' },
          { key: 'createdAt', header: 'Data', render: (l: any) => new Date(l.createdAt).toLocaleString('pt-BR') },
        ]}
        data={auditLogs}
        keyExtractor={(l: any) => l.id}
        emptyMessage="Nenhum log de auditoria encontrado"
      />
    </div>
  )
}

function TimelineTab({ events }: { events: any[] }) {
  return <Timeline events={events} />
}
