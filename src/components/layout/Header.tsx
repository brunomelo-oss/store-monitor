'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useApps, useBulkReplace } from '@/hooks/useApps'
import { useToast } from '@/components/Toast'
import { useLang } from '@/contexts/LanguageContext'
import { useUnreadCount, useNotifications, useMarkAllAsRead } from '@/features/notifications/hooks/useNotifications'
import { ProfileDropdown } from './ProfileDropdown'
import { Moon, Sun, RotateCcw, Languages, Bell, CheckCheck, XCircle, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { LangCode } from '@/lib/i18n'

export function Header() {
  const { isDark, toggle } = useTheme()
  const { data: apps = [] } = useApps()
  const bulkReplaceMutation = useBulkReplace()
  const { show } = useToast()
  const { lang, setLang, t } = useLang()
  const { data: unread } = useUnreadCount()
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const { data: notifList = [] } = useNotifications(5)
  const markAllMutation = useMarkAllAsRead()

  const languages: { code: LangCode; label: string }[] = [
    { code: 'en', label: t('header.langEn') },
    { code: 'pt', label: t('header.langPt') },
    { code: 'ar', label: t('header.langAr') },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    if (notifOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  const handleReset = async () => {
    if (confirm(t('header.resetConfirm'))) {
      try {
        const { MOCK_APPS } = await import('@/lib/mock-data')
        const fresh = JSON.parse(JSON.stringify(MOCK_APPS))
        await bulkReplaceMutation.mutateAsync(fresh)
        show(t('header.resetSuccess'), 'success')
      } catch {
        show(t('header.resetError'), 'error')
      }
    }
  }

  const notifIcon = (type: string) => {
    if (type.includes('rejection') || type.includes('failed') || type.includes('FAILED')) return { icon: XCircle, color: 'text-red-500' }
    if (type.includes('approval') || type.includes('success') || type.includes('SUCCESS')) return { icon: CheckCircle, color: 'text-emerald-500' }
    if (type.includes('comment') || type.includes('review')) return { icon: MessageSquare, color: 'text-blue-500' }
    if (type.includes('new_version') || type.includes('build')) return { icon: RefreshCw, color: 'text-amber-500' }
    return { icon: Bell, color: 'text-muted-foreground' }
  }

  function NotificationDropdown() {
    return (
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="relative w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
          title="Notificações"
        >
          <Bell size={13} />
          {(unread?.count || 0) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center text-white">
              {unread!.count > 9 ? '9+' : unread!.count}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 glass-dropdown rounded-xl overflow-hidden z-50 animate-dropdownIn">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/10">
              <span className="text-sm font-medium text-foreground">Notificações</span>
              <div className="flex items-center gap-2">
                {(unread?.count || 0) > 0 && (
                  <button
                    onClick={() => markAllMutation.mutate()}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={12} /> Ler todas
                  </button>
                )}
                <Link
                  href="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </Link>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifList.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground/60">
                  Nenhuma notificação
                </div>
              ) : (
                notifList.map(n => {
                  const { icon: NIcon, color } = notifIcon(n.type)
                  return (
                    <Link
                      key={n.id}
                      href={n.appId ? `/apps/${n.appId}` : '/notifications'}
                      onClick={() => setNotifOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04] ${!n.read ? 'bg-slate-50/50 dark:bg-white/[0.02]' : ''}`}
                    >
                      <NIcon size={15} className={`shrink-0 mt-0.5 ${color}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground/90 truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{new Date(n.createdAt).toLocaleString('pt-BR')}</p>
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
                onClick={() => setNotifOpen(false)}
                className="block text-center text-xs text-blue-600 dark:text-blue-400 py-3 border-t border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
              >
                Ver todas as notificações
              </Link>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <header className={`app-header sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-[url('/assets/logo-sasi-white.png')] bg-center bg-contain bg-no-repeat shrink-0" />
          <div className="flex flex-col">
            <span className="logo-sasi text-xl font-extrabold tracking-tight select-none leading-none" onDoubleClick={handleReset}>
              SASI
            </span>
            <span className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">
              {t('header.logoSubtitle')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface text-xs font-medium text-muted-foreground">
            <span className="font-semibold text-foreground">{apps.length}</span>
            {t('header.appCount', { count: '', s: apps.length !== 1 ? 's' : '' }).replace('{count}', '').trim()}
          </div>

          <NotificationDropdown />

          <button
            onClick={toggle}
            className="w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
            title={t('header.themeToggle')}
          >
            <div className="transition-transform duration-300 hover:scale-110 active:scale-90 flex items-center justify-center">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
              title={t('header.language')}
            >
              <Languages size={14} />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.18)] py-1.5 z-50 animate-dropdownIn">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false) }}
                      className={`w-full h-12 px-4 text-left text-sm flex items-center justify-between transition-colors ${lang === l.code ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                    >
                      {l.label}
                      {lang === l.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sasi-red" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <ProfileDropdown />

          <button
            onClick={handleReset}
            className="w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
            title={t('header.reset')}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </header>
  )
}
