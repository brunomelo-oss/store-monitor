'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { useActivity } from '@/features/activity/hooks/useActivity'
import { Timeline } from '@/components/Timeline'
import { Spinner } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Activity, RefreshCw, Filter } from 'lucide-react'
import { useState } from 'react'

type ActivityFilter = 'all' | 'audit_log' | 'sync' | 'notification' | 'job'

const filterLabels: Record<ActivityFilter, string> = {
  all: 'Todas',
  audit_log: 'Ações',
  sync: 'Sincronizações',
  notification: 'Notificações',
  job: 'Jobs',
}

export default function ActivityPage() {
  const { user, loading } = useAuth()
  const { data: activity, isLoading, error, refetch } = useActivity(200)
  const [filter, setFilter] = useState<ActivityFilter>('all')

  if (loading || !user) return <Spinner />
  if (error) return <ErrorState onRetry={() => refetch()} />

  const filtered = filter === 'all' ? (activity || []) : (activity || []).filter(a => a.type === filter)

  const timelineEvents = filtered.map(a => ({
    id: a.id,
    type: a.type,
    action: a.action,
    entity: a.entity,
    entityId: a.entityId,
    description: a.description,
    metadata: a.metadata,
    userId: a.userId,
    username: a.username,
    timestamp: a.createdAt,
  }))

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Feed de Atividade</h1>
          <p className="text-muted-foreground mt-1">Todas as ações, sincronizações e eventos do sistema</p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-muted-foreground" />
          {(['all', 'audit_log', 'sync', 'notification', 'job'] as ActivityFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === f ? 'bg-muted/50 font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {isLoading ? <Spinner /> : timelineEvents.length === 0 ? (
          <EmptyState icon={Activity} title="Nenhuma atividade" description="Nenhuma atividade registrada ainda" />
        ) : (
          <Timeline events={timelineEvents} />
        )}
      </main>
    </div>
  )
}
