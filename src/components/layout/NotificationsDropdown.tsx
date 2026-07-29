'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import { useUnreadCount, useNotifications, useMarkAllAsRead } from '@/features/notifications/hooks/useNotifications'
import { formatLocaleDate } from '@/lib/utils'
import { Bell, CheckCheck, XCircle, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react'

export function NotificationsDropdown() {
  const { t, lang } = useLang()
  const { data: unread } = useUnreadCount()
  const { data: notifList = [] } = useNotifications(5)
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

  const notifIcon = (type: string) => {
    if (type.includes('rejection') || type.includes('failed') || type.includes('FAILED')) return { icon: XCircle, color: 'text-red-500' }
    if (type.includes('approval') || type.includes('success') || type.includes('SUCCESS')) return { icon: CheckCircle, color: 'text-emerald-500' }
    if (type.includes('comment') || type.includes('review')) return { icon: MessageSquare, color: 'text-blue-500' }
    if (type.includes('new_version') || type.includes('build')) return { icon: RefreshCw, color: 'text-amber-500' }
    return { icon: Bell, color: 'text-muted-foreground' }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="header-icon-btn"
        aria-label={t('notifications.title')}
      >
        <Bell size={13} />
        {unread?.count ? (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-[8px] font-bold flex items-center justify-center text-white">
            {unread.count > 9 ? '9+' : unread.count}
          </span>
        ) : null}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-dropdown rounded-xl overflow-hidden z-50 animate-dropdownIn">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
            <span className="text-sm font-medium text-foreground">{t('notifications.title')}</span>
            <div className="flex items-center gap-2">
              {(unread?.count || 0) > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} /> {t('notifications.markAllRead')}
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </Link>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifList.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground/60">
                {t('notifications.empty')}
              </div>
            ) : (
              notifList.map(n => {
                const { icon: NIcon, color } = notifIcon(n.type)
                return (
                  <Link
                    key={n.id}
                    href={n.appId ? `/apps/${n.appId}` : '/notifications'}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.04] ${!n.read ? 'bg-slate-50 dark:bg-white/[0.02]' : ''}`}
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
              className="block text-center text-xs text-blue-400 py-3 border-t border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
            >
              {t('notifications.viewAll')}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
