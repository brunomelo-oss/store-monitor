'use client'

import { useState } from 'react'
import { Suspense } from 'react'
import { NavTabs } from '@/components/layout/NavTabs'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppsView } from '@/features/apps/components/AppsView'
import { UserManager } from '@/features/admin/components/UserManager'
import { MetricCard } from '@/components/MetricCard'
import { StatusBadge } from '@/components/StatusBadge'
import { useApps } from '@/hooks/useApps'
import { useSyncHistory } from '@/features/sync/hooks/useSyncHistory'
import { useSyncJobs } from '@/features/sync/hooks/useSyncJobs'
import { useHealth } from '@/features/health/hooks/useHealth'
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications'
import { useActivity } from '@/features/activity/hooks/useActivity'
import { Spinner } from '@/components/LoadingSkeleton'
import { Smartphone, CheckCircle, XCircle, RefreshCw, Clock, Star, AlertTriangle, Bell, Activity, BarChart3, ArrowRight, Globe, Apple, HeartPulse } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ErrorState } from '@/components/ErrorState'

export function DashboardView() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div>
      <NavTabs active={activeTab} onChange={setActiveTab} />

      <div className="mt-8">
        {activeTab === 'dashboard' && (
          <Suspense fallback={<DashboardSkeleton />}>
            <div className="space-y-8">
              <ErrorBoundary><CommandCenter /></ErrorBoundary>
            </div>
          </Suspense>
        )}

        {activeTab === 'apps' && <ErrorBoundary><AppsView /></ErrorBoundary>}
        {activeTab === 'users' && <ErrorBoundary><UserManager /></ErrorBoundary>}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 rounded-lg bg-muted" />)}
      </div>
      <div className="h-80 rounded-lg bg-muted" />
    </div>
  )
}

function CommandCenter() {
  const { data: apps = [] } = useApps()
  const { data: syncHistory = [] } = useSyncHistory()
  const { data: jobs = [] } = useSyncJobs()
  const { data: health } = useHealth()
  const { data: unread } = useUnreadCount()
  const { data: activity = [] } = useActivity(10)

  const today = new Date().toDateString()
  const todaySyncs = syncHistory.filter(s => new Date(s.startedAt).toDateString() === today)
  const successToday = todaySyncs.filter(s => s.status === 'SUCCESS').length
  const failedToday = todaySyncs.filter(s => s.status === 'FAILED').length

  const pendingJobs = jobs.filter(j => j.status === 'PENDING').length
  const failedJobs = jobs.filter(j => j.status === 'FAILED').length

  const publishedApps = apps.filter(a => a.playStatus === 'PUBLISHED' || a.appStatus === 'PUBLISHED').length
  const inReviewApps = apps.filter(a => a.playStatus === 'REVIEW' || a.appStatus === 'REVIEW').length
  const rejectedApps = apps.filter(a => a.playStatus === 'REJECTED' || a.appStatus === 'REJECTED').length
  const attentionApps = apps.filter(a => a.playStatus === 'REJECTED' || a.appStatus === 'REJECTED' || a.playStatus === null && a.appStatus === null).length

  const avgRating = apps.reduce((sum, a) => sum + (a.rating || 0), 0) / (apps.filter(a => a.rating).length || 1)

  const chartData = syncHistory.slice(0, 14).reverse().reduce((acc: any[], s) => {
    const day = new Date(s.startedAt).toLocaleDateString('pt-BR')
    const existing = acc.find(a => a.day === day)
    if (existing) {
      existing.total++
      if (s.status === 'SUCCESS') existing.success++
      if (s.status === 'FAILED') existing.failed++
    } else {
      acc.push({ day, total: 1, success: s.status === 'SUCCESS' ? 1 : 0, failed: s.status === 'FAILED' ? 1 : 0 })
    }
    return acc
  }, [])

  if (!apps.length && !syncHistory.length) return <Spinner />

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Command Center</h2>
        <p className="text-sm text-muted-foreground">O que precisa de atenção hoje?</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Apps Publicados" value={publishedApps} icon={<Smartphone size={16} />} variant="success" subtitle={`de ${apps.length} total`} />
        <MetricCard title="Em Revisão" value={inReviewApps} icon={<Clock size={16} />} variant="warning" />
        <MetricCard title="Rejeitados" value={rejectedApps} icon={<XCircle size={16} />} variant="danger" subtitle="Requer atenção" />
        <MetricCard title="Precisam Atenção" value={attentionApps} icon={<AlertTriangle size={16} />} variant={attentionApps > 0 ? 'danger' : 'success'} />
        <MetricCard title="Syncs Hoje" value={successToday} subtitle={`${failedToday} falhas`} icon={<RefreshCw size={16} />} variant={failedToday > 0 ? 'warning' : 'default'} />
        <MetricCard title="Jobs Pendentes" value={pendingJobs} icon={<Clock size={16} />} variant={pendingJobs > 0 ? 'warning' : 'default'} />
        <MetricCard title="Jobs com Falha" value={failedJobs} icon={<XCircle size={16} />} variant={failedJobs > 0 ? 'danger' : 'default'} />
        <MetricCard title="Notificações" value={unread?.count || 0} icon={<Bell size={16} />} variant={(unread?.count || 0) > 0 ? 'warning' : 'default'} subtitle="não lidas" />
        <MetricCard title="Rating Médio" value={avgRating ? avgRating.toFixed(1) : '—'} icon={<Star size={16} />} subtitle="de 5.0" />
        <MetricCard title="Latência Sync" value={health?.metrics.syncLatency ? `${(health.metrics.syncLatency.value / 1000).toFixed(1)}s` : '—'} icon={<Activity size={16} />} />
        <MetricCard title="Falhas (24h)" value={health?.metrics.failedJobs24h || 0} icon={<XCircle size={16} />} variant={(health?.metrics.failedJobs24h || 0) > 0 ? 'danger' : 'default'} />
        <MetricCard title="Syncs (24h)" value={health?.metrics.totalSyncs24h || 0} icon={<RefreshCw size={16} />} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {activity.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  {a.type === 'audit_log' ? <Activity size={12} /> : a.type === 'sync' ? <RefreshCw size={12} /> : a.type === 'notification' ? <Bell size={12} /> : <Clock size={12} />}
                </div>
                <div className="min-w-0">
                  <p className="truncate">{a.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ))}
            <Link href="/activity" className="flex items-center gap-1 text-sm text-blue-400 hover:underline pt-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Sincronizações por Dia</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="success" fill="#22c55e" stackId="a" radius={[2, 2, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" stackId="a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Sem dados de sincronização</p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Acesso Rápido</h3>
          <div className="space-y-2">
            {[
              { label: 'Apps', href: '/apps', icon: Globe, color: 'text-blue-500' },
              { label: 'Sincronização', href: '/sync', icon: RefreshCw, color: 'text-green-500' },
              { label: 'Notificações', href: '/notifications', icon: Bell, color: 'text-yellow-500' },
              { label: 'Atividade', href: '/activity', icon: Activity, color: 'text-purple-500' },
              { label: 'Saúde do Sistema', href: '/health', icon: HeartPulse, color: 'text-red-500' },
              { label: 'Conexões', href: '/admin/connections', icon: Globe, color: 'text-zinc-400' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <link.icon size={18} className={link.color} />
                <span className="flex-1 text-sm font-medium">{link.label}</span>
                <ArrowRight size={14} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Status dos Apps</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {apps.slice(0, 12).map(app => (
            <Link
              key={app.id}
              href={`/apps/${app.id}`}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                app.playStatus === 'PUBLISHED' || app.appStatus === 'PUBLISHED' ? 'bg-green-500/10 text-green-400' :
                app.playStatus === 'REJECTED' || app.appStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                'bg-yellow-500/10 text-yellow-400'
              }`}>
                {app.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{app.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <StatusBadge status={app.playStatus || '—'} />
                  {app.rating && <span>★ {app.rating.toFixed(1)}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {apps.length > 12 && (
          <Link href="/apps" className="flex items-center justify-center gap-1 mt-3 text-sm text-blue-400 hover:underline py-2">
            Ver todos os {apps.length} apps <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}
