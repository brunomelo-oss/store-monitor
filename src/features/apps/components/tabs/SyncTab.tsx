'use client'

import { useSyncHistory } from '@/features/sync/hooks/useSyncHistory'
import { useTriggerSync } from '@/features/sync/hooks/useTriggerSync'
import { Spinner } from '@/components/LoadingSkeleton'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable } from '@/components/DataTable'
import { Globe, Apple, RefreshCw } from 'lucide-react'

export function SyncTab({ appId }: { appId: number }) {
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
          { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
          { key: 'type', header: 'Tipo', render: (s) => s.type },
          { key: 'store', header: 'Loja', render: (s) => s.store === 'GOOGLE' ? <span className="flex items-center gap-1"><Globe size={12} />Google</span> : <span className="flex items-center gap-1"><Apple size={12} />Apple</span> },
          { key: 'triggerType', header: 'Disparo', render: (s) => s.triggerType },
          { key: 'changesDetected', header: 'Alterações', render: (s) => s.changesDetected || 0 },
          { key: 'startedAt', header: 'Data', render: (s) => new Date(s.startedAt).toLocaleString('pt-BR') },
        ]}
        data={appSyncs}
        keyExtractor={(s) => s.id}
        emptyMessage="Nenhuma sincronização encontrada para este app"
      />
    </div>
  )
}
