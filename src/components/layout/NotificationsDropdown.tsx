'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import { useUnreadCount, useNotifications, useMarkAllAsRead } from '@/hooks/useNotifications'
import { formatLocaleDate } from '@/lib/utils'
import { Bell, CheckCheck, XCircle, CheckCircle, MessageSquare, RefreshCw, type LucideIcon } from 'lucide-react'

export function NotificationsDropdown() {
  const { t, lang } = useLang()
  const { data: unread } = useUnreadCount()
  const count = unread ?? 0
  const { data: notifList = [] } = useNotifications({ limit: 5 })
  const markAllMutation = useMarkAllAsRead()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const notifIcon = (category: string): { icon: LucideIcon; color: string } => {
    if (category === 'rejection') return { icon: XCircle, color: 'text-red-500' }
    if (category === 'approval') return { icon: CheckCircle, color: 'text-emerald-500' }
    if (category === 'new_version' || category === 'build') return { icon: RefreshCw, color: 'text-amber-500' }
    if (category === 'sync') return { icon: RefreshCw, color: 'text-blue-500' }
    return { icon: Bell, color: 'text-muted-foreground' }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="header-icon-btn" aria-label={t('notifications.title')}>
        <Bell size={13} />
        {(count) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-[8px] font-bold flex items-center justify-center text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-dropdown rounded-xl overflow-hidden z-50 animate-dropdownIn">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium text-foreground">{t('notifications.title')}</span>
            <div className="flex items-center gap-2">
              {(count) > 0 && (
                <button onClick={() => markAllMutation.mutate()} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                  <CheckCheck size={12} /> {t('notifications.markAllRead')}
                </button>
              )}
              <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground" aria-label={t('notifications.viewAll')}>
                <Bell size={13} />
              </Link>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifList.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground/60">{t('notifications.empty')}</div>
            ) : (
              notifList.map(n => {
                const { icon: NIcon, color } = notifIcon(n.category)
                return (
                  <Link
                    key={n.id}
                    href={n.appId ? `/apps/${n.appId}` : '/notifications'}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface ${!n.read ? 'bg-surface/60' : ''}`}
                  >
                    <NIcon size={15} className={`shrink-0 mt-0.5 ${color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground/90 truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{formatLocaleDate(n.createdAt, lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'pt-BR')}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                  </Link>
                )
              })
            )}
          </div>
          {notifList.length > 0 && (
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-blue-400 py-3 border-t border-border hover:bg-surface"
            >
              {t('notifications.viewAll')}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}