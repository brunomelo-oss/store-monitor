'use client'

import type { AppDetail } from '@/features/apps/hooks/useAppDetail'
import type { SyncHistoryItem } from '@/services/sync.service'
import { StatusBadge } from '@/components/StatusBadge'
import { MetricCard } from '@/components/MetricCard'
import { DataTable } from '@/components/DataTable'
import { formatLocaleDate } from '@/lib/utils'
import { Smartphone, Star, RefreshCw, Globe, Apple } from 'lucide-react'

export function OverviewTab({ app, syncHistory }: { app: AppDetail; syncHistory: SyncHistoryItem[] }) {
  const lastSync = syncHistory[0]
  const successSyncs = syncHistory.filter(s => s.status === 'SUCCESS').length
  const failedSyncs = syncHistory.filter(s => s.status === 'FAILED').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Status" value={app.playStatus === 'PUBLISHED' || app.appStatus === 'PUBLISHED' ? 'Published' : app.playStatus === 'REJECTED' || app.appStatus === 'REJECTED' ? 'Rejected' : 'In Review'} variant={app.playStatus === 'PUBLISHED' || app.appStatus === 'PUBLISHED' ? 'success' : app.playStatus === 'REJECTED' || app.appStatus === 'REJECTED' ? 'rejected' : 'warning'} icon={<Smartphone size={16} />} />
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
            { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
            { key: 'type', header: 'Tipo', render: (s) => s.type },
            { key: 'triggerType', header: 'Disparo', render: (s) => s.triggerType },
            { key: 'changesDetected', header: 'Alterações', render: (s) => s.changesDetected || 0 },
            { key: 'startedAt', header: 'Data', render: (s) => formatLocaleDate(s.startedAt) },
          ]}
          data={syncHistory.slice(0, 10)}
          keyExtractor={(s) => s.id}
        />
      </div>
    </div>
  )
}
