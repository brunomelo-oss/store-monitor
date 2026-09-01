'use client'

import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { useActivity } from '@/hooks/useActivity'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatLocaleDate } from '@/lib/utils'
import type { ActivityItem, ActivityType } from '@/lib/types'
import { ScrollText, Activity as ActivityIcon } from 'lucide-react'

const TYPES: { id: ActivityType | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'Tudo', color: 'neutral' },
  { id: 'audit_log', label: 'Auditoria', color: 'info' },
  { id: 'sync', label: 'Sync', color: 'success' },
  { id: 'notification', label: 'Notificações', color: 'warning' },
  { id: 'job', label: 'Tarefas', color: 'danger' },
]

export function ActivityView() {
  const { t, lang } = useLang()
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'ar-SA'
  const [type, setType] = useState<ActivityType | 'all'>('all')

  const { data: activity = [], isLoading } = useActivity({ limit: 200 })

  const filtered = type === 'all' ? activity : activity.filter(a => a.type === type)

  const columns: Column<ActivityItem>[] = [
    {
      key: 'type',
      header: 'Tipo',
      sortValue: a => a.type,
      render: a => (
        <Badge variant={a.type === 'sync' ? 'success' : a.type === 'audit_log' ? 'info' : a.type === 'notification' ? 'warning' : 'danger'} size="sm" className="capitalize">
          {a.type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: a => (
        <div className="max-w-md">
          <p className="text-foreground text-[13px] leading-snug">{a.description}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{a.action}</p>
        </div>
      ),
    },
    {
      key: 'entity',
      header: 'Entidade',
      sortValue: a => a.entity || '',
      render: a => <span className="text-xs text-muted-foreground">{a.entity || '—'}</span>,
    },
    {
      key: 'username',
      header: 'Usuário',
      sortValue: a => a.username || '',
      render: a => <span className="text-xs text-muted-foreground">{a.username || '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Data',
      sortValue: a => new Date(a.createdAt).getTime(),
      render: a => <span className="text-xs text-muted-foreground whitespace-nowrap">{formatLocaleDate(a.createdAt, locale)}</span>,
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('search.activities')}</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro completo de atividades do sistema.</p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-5">
        {TYPES.map(tp => (
          <button
            key={tp.id}
            onClick={() => setType(tp.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              type === tp.id ? 'bg-sasi-red text-white border-sasi-red shadow-sm' : 'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {tp.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={isLoading}
        defaultSortedKey="createdAt"
        pageSize={15}
        empty={<EmptyState icon={ScrollText} title="Nenhuma atividade" description="Nenhum evento registrado para este filtro." />}
      />
    </div>
  )
}