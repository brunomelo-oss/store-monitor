'use client'

import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import type { App } from '@/lib/types'
import { overallStatus, statusColor, getAccountName, formatLocaleDate, appIcon } from '@/lib/utils'
import { useSyncJobs, useTriggerSync } from '@/hooks/useSync'
import { useNotifications } from '@/hooks/useNotifications'
import { useActivity } from '@/hooks/useActivity'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/primitives'
import { useToast } from '@/components/ui/Toast'
import { Smartphone, Apple, RefreshCw, LayoutGrid, Clock, GitBranch, Bell, ScrollText, Info } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Visão geral', icon: LayoutGrid },
  { id: 'versions', label: 'Versões', icon: GitBranch },
  { id: 'sync', label: 'Sync', icon: RefreshCw },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'audit', label: 'Auditoria', icon: ScrollText },
  { id: 'info', label: 'Informações', icon: Info },
]

function StoreRow({ label, version, status, lastUpdate }: { label: string; version: string; status: string; lastUpdate: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface/60 border border-border">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold uppercase ${label === 'Google Play' ? 'text-emerald-500' : 'text-blue-500'}`}>{label}</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground text-xs">{formatLocaleDate(lastUpdate, undefined, 'date')}</span>
        <span className="font-medium text-foreground">{version ? `v${version}` : '--'}</span>
        <span className={`text-xs font-medium capitalize ${statusColor(status)}`}>{status}</span>
      </div>
    </div>
  )
}

export function AppDetailView({ app }: { app: App }) {
  const { t, lang } = useLang()
  const { show } = useToast()
  const [tab, setTab] = useState('overview')
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'ar-SA'

  const { data: jobs } = useSyncJobs()
  const { mutateAsync: triggerSync, isPending: syncing } = useTriggerSync()
  const { data: notifications = [] } = useNotifications({ search: app.name })
  const { data: activity = [] } = useActivity({ limit: 50 })

  const appJobs = (jobs ?? []).filter(j => j.appId === app.id)
  const appActivity = activity.filter(a => a.entityId === app.id || a.entity?.toLowerCase().includes(app.name.toLowerCase()))

  const appNotifications = notifications.length > 0
    ? notifications
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-16 h-16 rounded-2xl bg-surface overflow-hidden flex items-center justify-center shrink-0">
          {appIcon(app) ? <img src={appIcon(app)} alt="" className="w-full h-full object-cover" /> : <Smartphone size={24} className="text-muted-foreground/60" />}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground truncate">{app.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={overallStatus(app) === 'published' ? 'success' : overallStatus(app) === 'rejected' ? 'danger' : overallStatus(app) === 'review' ? 'warning' : 'neutral'} dot className="capitalize">
              {overallStatus(app)}
            </Badge>
            <Badge variant="neutral">{app.region}</Badge>
            {app.rating > 0 && <span className="text-xs text-muted-foreground">★ {app.rating.toFixed(1)}</span>}
          </div>
        </div>
        <Button variant="secondary" onClick={async () => {
          try {
            await triggerSync({ appId: app.id, store: 'both' })
            show(t('appCard.syncTriggered'), 'success')
          } catch {
            show(t('appCard.syncFailed'), 'error')
          }
        }} disabled={syncing}>
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {t('appCard.syncTriggered')}
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(tb => {
          const Icon = tb.icon
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition ${
                tab === tb.id ? 'border-sasi-red text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={14} />
              {tb.label}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="sasi-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Status das lojas</h3>
            <div className="space-y-2">
              <StoreRow label="Google Play" version={app.playStore.version} status={app.playStore.status} lastUpdate={app.playStore.lastUpdate} />
              <StoreRow label="App Store" version={app.appStore.version} status={app.appStore.status} lastUpdate={app.appStore.lastUpdate} />
            </div>
          </div>
          <div className="sasi-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Últimos syncs</h3>
            {appJobs.length === 0 ? (
              <EmptyState icon={RefreshCw} title="Nenhum sync" description="Ainda não há sincronizações registradas para este app." />
            ) : (
              <div className="space-y-2">
                {appJobs.slice(0, 5).map(job => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-surface/60 border border-border">
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{job.store}</span>
                    </div>
                    <StatusBadge status={job.status} />
                    <span className="text-xs text-muted-foreground">{formatLocaleDate(job.createdAt, locale)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'versions' && (
        <div className="sasi-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Versões publicadas</h3>
          <div className="space-y-2">
            <StoreRow label="Google Play" version={app.playStore.version} status={app.playStore.status} lastUpdate={app.playStore.lastUpdate} />
            <StoreRow label="App Store" version={app.appStore.version} status={app.appStore.status} lastUpdate={app.appStore.lastUpdate} />
          </div>
        </div>
      )}

      {tab === 'sync' && (
        <div className="sasi-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Histórico de sincronização</h3>
          {appJobs.length === 0 ? (
            <EmptyState icon={RefreshCw} title="Nenhum sync" description="Disparado automaticamente ou manualmente." />
          ) : (
            <div className="space-y-2">
              {appJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-surface/60 border border-border flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{job.id}</span>
                    <span className="text-xs text-muted-foreground">{job.store}</span>
                  </div>
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-muted-foreground">{formatLocaleDate(job.createdAt, locale)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'alerts' && (
        <div className="sasi-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Notificações do app</h3>
          {appNotifications.length === 0 ? (
            <EmptyState icon={Bell} title="Sem notificações" description="Nenhuma notificação registrada para este app." />
          ) : (
            <div className="space-y-2">
              {appNotifications.slice(0, 20).map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface/60 border border-border">
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-2 ${n.read ? 'bg-muted' : 'bg-blue-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatLocaleDate(n.createdAt, locale)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div className="sasi-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Registro de atividade</h3>
          {appActivity.length === 0 ? (
            <EmptyState icon={ScrollText} title="Sem atividades" description="Nenhum evento de auditoria para este app." />
          ) : (
            <div className="space-y-2">
              {appActivity.slice(0, 30).map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface/60 border border-border">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{a.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground/60">{formatLocaleDate(a.createdAt, locale)}</span>
                      {a.username && <span className="text-xs text-muted-foreground/60">· {a.username}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground uppercase">{a.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'info' && (
        <div className="sasi-card rounded-xl p-5 max-w-lg">
          <h3 className="font-semibold text-foreground mb-4">Informações</h3>
          <dl className="space-y-3 text-sm">
            {[
              ['Nome', app.name],
              ['Região', app.region],
              ['Conta Google', getAccountName('google', app.googleAccount)],
              ['Conta Apple', getAccountName('apple', app.appleAccount)],
              ['Package Name', app.packageName || '—'],
              ['Bundle ID', app.bundleId || '—'],
              ['Instalações', app.installations ? app.installations.toLocaleString('pt-BR') : '—'],
              ['Criado em', app.createdAt ? formatLocaleDate(app.createdAt, locale) : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-foreground text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}