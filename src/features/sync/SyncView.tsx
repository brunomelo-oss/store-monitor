'use client'

import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { useSyncJobs, useSyncHistory, useRetryJob, useDeleteJob, useTriggerSync } from '@/hooks/useSync'
import { useApps } from '@/hooks/useApps'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/primitives'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatLocaleDate } from '@/lib/utils'
import type { SyncJob, SyncJobStatus } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'
import { RefreshCw, RotateCcw, Trash2 } from 'lucide-react'

const STATUS_FILTERS: (SyncJobStatus | 'all')[] = ['all', 'PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED', 'IGNORED']

export function SyncView() {
  const { lang } = useLang()
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'ar-SA'
  const { show } = useToast()
  const [status, setStatus] = useState<SyncJobStatus | 'all'>('all')

  const { data: jobs = [], isLoading } = useSyncJobs()
  const { data: history = [] } = useSyncHistory()
  const retry = useRetryJob()
  const del = useDeleteJob()
  const trigger = useTriggerSync()
  const { data: apps = [] } = useApps()

  const list = status === 'all' ? jobs : jobs.filter(j => j.status === status)

  const columns: Column<SyncJob>[] = [
    {
      key: 'id',
      header: 'Job',
      sortValue: j => j.id,
      render: j => (
        <div>
          <p className="text-xs font-medium text-foreground">#{j.id}</p>
          <p className="text-[10px] text-muted-foreground">{j.store}</p>
        </div>
      ),
    },
    {
      key: 'appName',
      header: 'App',
      sortValue: j => j.appName,
      render: j => <span className="text-[13px] text-foreground">{j.appName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: j => j.status,
      render: j => <StatusBadge status={j.status} />,
    },
    {
      key: 'message',
      header: 'Mensagem',
      render: j => <span className="text-xs text-muted-foreground max-w-xs block truncate">{j.message || '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Criado',
      sortValue: j => new Date(j.createdAt).getTime(),
      render: j => <span className="text-xs text-muted-foreground whitespace-nowrap">{formatLocaleDate(j.createdAt, locale)}</span>,
    },
    {
      key: 'finishedAt',
      header: 'Concluído',
      sortValue: j => (j.finishedAt ? new Date(j.finishedAt).getTime() : 0),
      render: j => <span className="text-xs text-muted-foreground whitespace-nowrap">{j.finishedAt ? formatLocaleDate(j.finishedAt, locale) : '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: j => (
        <div className="flex items-center gap-1">
          {['FAILED', 'PENDING'].includes(j.status) && (
            <button
              onClick={() => { retry.mutate(j.id) }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-sky-400 transition hover:bg-surface"
              title="Reprocessar"
            >
              <RotateCcw size={13} />
            </button>
          )}
          <button
            onClick={() => { if (confirm('Excluir job?')) del.mutate(j.id) }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 transition hover:bg-surface"
            title="Excluir"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  const triggerAll = async () => {
    const results = await Promise.allSettled(apps.map(a => trigger.mutateAsync({ appId: a.id, store: 'both' })))
    const failed = results.filter(r => r.status === 'rejected').length
    show(failed === 0 ? 'Sync disparado para todos os apps' : `${failed} sync(s) falharam`, failed === 0 ? 'success' : 'warning')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sincronização</h1>
          <p className="text-sm text-muted-foreground mt-1">Jobs de sincronização com as lojas e histórico.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onChange={e => setStatus(e.target.value as SyncJobStatus | 'all')} className="w-40">
            {STATUS_FILTERS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'Todos os status' : s}</option>
            ))}
          </Select>
          <button
            onClick={triggerAll}
            disabled={trigger.isPending}
            className="sasi-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs"
          >
            <RefreshCw size={13} className={trigger.isPending ? 'animate-spin' : ''} /> Sync agora
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {(['SUCCESS', 'FAILED', 'PARTIAL', 'PENDING'] as SyncJobStatus[]).map(s => {
          const count = jobs.filter(j => j.status === s).length
          return (
            <div key={s} className="sasi-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={s} />
                <span className="text-2xl font-bold text-foreground">{count}</span>
              </div>
            </div>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        rows={list}
        loading={isLoading}
        defaultSortedKey="createdAt"
        pageSize={12}
        empty={<EmptyState icon={RefreshCw} title="Nenhum job" description="Nenhum job de sincronização neste filtro." />}
      />

      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Badge variant="info" dot>Histórico</Badge>
        </h2>
        {history.length === 0 ? (
          <EmptyState icon={RefreshCw} title="Sem histórico" description="O histórico de sync será exibido aqui." />
        ) : (
          <DataTable
            columns={[
              { key: 'appName', header: 'App', sortValue: h => h.appName, render: h => <span className="text-[13px] text-foreground">{h.appName}</span> },
              { key: 'store', header: 'Loja', render: h => <span className="text-xs text-muted-foreground">{h.store}</span> },
              { key: 'status', header: 'Status', sortValue: h => h.status, render: h => <StatusBadge status={h.status} /> },
              { key: 'syncedAt', header: 'Sincronizado', sortValue: h => new Date(h.syncedAt).getTime(), render: h => <span className="text-xs text-muted-foreground whitespace-nowrap">{formatLocaleDate(h.syncedAt, locale)}</span> },
            ]}
            rows={history}
            pageSize={10}
            empty={<EmptyState icon={RefreshCw} title="Sem histórico" description="Sem registros." />}
          />
        )}
      </div>
    </div>
  )
}