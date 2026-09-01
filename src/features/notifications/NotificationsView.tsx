'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications'
import { useApps } from '@/hooks/useApps'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatLocaleDate } from '@/lib/utils'
import type { NotificationCategory, NotificationPriority } from '@/lib/types'
import { Bell, CheckCheck } from 'lucide-react'

const PRIORITY_VARIANT: Record<NotificationPriority, 'danger' | 'warning' | 'neutral'> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
}

const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  approval: 'Aprovação',
  rejection: 'Rejeição',
  new_version: 'Nova versão',
  build: 'Build',
  sync: 'Sync',
  system: 'Sistema',
}

type Filter = 'all' | NotificationCategory | 'unread'

export function NotificationsView() {
  const { t, lang } = useLang()
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'ar-SA'
  const [filter, setFilter] = useState<Filter>('all')

  const { data: notifications = [], isLoading } = useNotifications({ limit: 200 })
  const { data: apps = [] } = useApps()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const appName = (appId: number | null | undefined) => apps.find(a => a.id === appId)?.name

  const filtered = notifications
    .filter(n => filter === 'all' || filter === 'unread' ? (filter === 'unread' ? !n.read : true) : n.category === filter)

  const cats: Filter[] = ['all', 'approval', 'rejection', 'new_version', 'build', 'sync', 'system', 'unread']

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('notifications.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">Central de alertas e novidades dos apps.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={() => markAllAsRead.mutate()}
            className="sasi-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs"
          >
            <CheckCheck size={14} /> {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap mb-5">
        {cats.map(c => {
          const count = c === 'all' ? notifications.length : c === 'unread' ? notifications.filter(n => !n.read).length : notifications.filter(n => n.category === c).length
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                filter === c ? 'bg-sasi-red text-white border-sasi-red shadow-sm' : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {c === 'all' ? 'Tudo' : c === 'unread' ? 'Não lidas' : CATEGORY_LABEL[c as NotificationCategory]}
              <span className={`ml-1.5 ${filter === c ? 'text-white/70' : 'text-muted-foreground/60'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bell} title={t('notifications.empty')} description="Nenhuma notificação neste filtro." />
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <Link
              key={n.id}
              href={n.appId ? `/apps/${n.appId}` : '/notifications'}
              onClick={() => { if (!n.read) markAsRead.mutate(n.id) }}
              className={`flex items-start gap-3 p-4 rounded-xl border transition group ${
                n.read ? 'bg-surface/40 border-border' : 'bg-card border-sasi-red/20 hover:border-sasi-red/40'
              }`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 mt-2 ${n.read ? 'bg-muted' : 'bg-sasi-red animate-pulse'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-medium ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</p>
                  <Badge variant={PRIORITY_VARIANT[n.priority]} size="sm">{n.priority}</Badge>
                  <Badge variant="info" size="sm">{CATEGORY_LABEL[n.category]}</Badge>
                  {appName(n.appId) && <span className="text-xs text-muted-foreground/70">· {appName(n.appId)}</span>}
                </div>
                <p className="text-[13px] text-muted-foreground mt-1">{n.message}</p>
              </div>
              <span className="text-xs text-muted-foreground/60 whitespace-nowrap shrink-0">{formatLocaleDate(n.createdAt, locale)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}