'use client'

import { useState } from 'react'
import { Bell, CheckCheck, Filter, Search, AlertTriangle, Info, Star, RefreshCw, XCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/features/notifications/hooks/useNotifications'
import { Spinner } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'

const typeIcons: Record<string, typeof Bell> = {
  NEW_VERSION: Star,
  BUILD_APPROVED: CheckCircle,
  BUILD_REJECTED: XCircle,
  REVIEW_STARTED: RefreshCw,
  REVIEW_COMPLETED: CheckCircle,
  REJECTION: XCircle,
  APP_REMOVED: XCircle,
  RATING_CHANGED: Star,
  SYNC_FAILURE: XCircle,
  INFO: Info,
}

const typeColors: Record<string, string> = {
  NEW_VERSION: 'text-blue-500 bg-blue-500/10',
  BUILD_APPROVED: 'text-green-500 bg-green-500/10',
  BUILD_REJECTED: 'text-red-500 bg-red-500/10',
  REVIEW_STARTED: 'text-yellow-500 bg-yellow-500/10',
  REVIEW_COMPLETED: 'text-green-500 bg-green-500/10',
  REJECTION: 'text-red-500 bg-red-500/10',
  SYNC_FAILURE: 'text-red-500 bg-red-500/10',
  INFO: 'text-zinc-400 bg-zinc-400/10',
}

type Category = 'all' | 'unread' | 'review' | 'build' | 'sync' | 'other'

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const { data: notifications, isLoading, error, refetch } = useNotifications(100)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [priority, setPriority] = useState<'all' | 'high' | 'normal'>('all')

  if (loading || !user) return <Spinner />
  if (error) return <ErrorState onRetry={() => refetch()} />

  const q = search.toLowerCase()
  const filtered = (notifications || []).filter(n => {
    if (category === 'unread' && n.read) return false
    if (category === 'review' && !['REVIEW_STARTED', 'REVIEW_COMPLETED', 'REJECTION'].includes(n.type)) return false
    if (category === 'build' && !['BUILD_APPROVED', 'BUILD_REJECTED'].includes(n.type)) return false
    if (category === 'sync' && n.type !== 'SYNC_FAILURE') return false
    if (category === 'other' && ['REVIEW_STARTED', 'REVIEW_COMPLETED', 'REJECTION', 'BUILD_APPROVED', 'BUILD_REJECTED', 'SYNC_FAILURE'].includes(n.type)) return false
    if (q && !n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) return false
    return true
  })

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'unread', label: 'Não lidas' },
    { id: 'review', label: 'Revisões' },
    { id: 'build', label: 'Builds' },
    { id: 'sync', label: 'Sincronização' },
    { id: 'other', label: 'Outras' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Central de Notificações</h1>
            <p className="text-muted-foreground mt-1">Acompanhe todas as notificações do sistema</p>
          </div>
          <button
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border hover:bg-muted/50 disabled:opacity-50 transition-colors"
          >
            <CheckCheck size={16} />
            Marcar todas como lidas
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar notificações..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-transparent outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${category === cat.id ? 'bg-muted/50 font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState icon={Bell} title="Nenhuma notificação" description={search ? `Nenhuma notificação encontrada para "${search}"` : 'Nenhuma notificação disponível'} />
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const Icon = typeIcons[n.type] || Bell
              const color = typeColors[n.type] || 'text-zinc-400 bg-zinc-400/10'
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${n.read ? 'opacity-60' : 'bg-muted/20'}`}
                  onClick={() => !n.read && markAsRead.mutate(n.id)}
                >
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${n.read ? 'font-normal' : 'font-semibold'}`}>{n.title}</h3>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  {n.appId && (
                    <span className="text-xs text-muted-foreground shrink-0 mt-1">App #{n.appId}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
