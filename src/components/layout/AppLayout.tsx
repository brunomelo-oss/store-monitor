'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useApps } from '@/hooks/useApps'
import { useLang } from '@/contexts/LanguageContext'
import { useUnreadCount, useNotifications, useMarkAllAsRead } from '@/features/notifications/hooks/useNotifications'
import { GlobalSearch } from './GlobalSearch'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'
import {
  Layers, Users, Bell, Smartphone, Shield, LayoutDashboard,
  CheckCheck, XCircle, CheckCircle, MessageSquare, RefreshCw,
  Settings, LogOut, Lock, ChevronDown, User,
} from 'lucide-react'
import type { LangCode } from '@/lib/i18n'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const { data: apps = [] } = useApps()
  const { lang, setLang, t } = useLang()
  const { data: unread } = useUnreadCount()
  const { data: notifList = [] } = useNotifications(5)
  const markAllMutation = useMarkAllAsRead()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    if (notifOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false)
    }
    if (settingsOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [settingsOpen])

  const isAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN'
  const navItems = [
    { id: '/apps', label: t('nav.apps'), icon: Layers },
    { id: '/admin', label: t('nav.users'), icon: Users },
    ...(isAdmin ? [{ id: '/admin/connections', label: t('nav.connections'), icon: Shield }] : []),
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const notifIcon = (type: string) => {
    if (type.includes('rejection') || type.includes('failed') || type.includes('FAILED')) return { icon: XCircle, color: 'text-red-500' }
    if (type.includes('approval') || type.includes('success') || type.includes('SUCCESS')) return { icon: CheckCircle, color: 'text-emerald-500' }
    if (type.includes('comment') || type.includes('review')) return { icon: MessageSquare, color: 'text-blue-500' }
    if (type.includes('new_version') || type.includes('build')) return { icon: RefreshCw, color: 'text-amber-500' }
    return { icon: Bell, color: 'text-muted-foreground' }
  }

  if (!user) return <>{children}</>

  const [local, domain] = user.email.split('@')
  const display = local.length > 14 ? local.slice(0, 12) + '…@' + domain : user.email

  const languages: { code: LangCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'ar', label: 'العربية' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-48 z-30 sasi-sidebar flex flex-col">
        {/* SASI Logo */}
          <div className="flex items-center justify-center h-16 shrink-0 border-b border-[var(--surface-glass-border)]">
          <div className="w-32 h-10 bg-center bg-contain bg-no-repeat" style={{ backgroundImage: `url(${isDark ? '/assets/logo-white.png' : '/assets/logo-black.png'})` }} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pt-3 space-y-0.5 overflow-y-auto">
          <Link
            href="/"
            className={`sasi-nav-item ${isActive('/') ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} className="shrink-0 opacity-70" />
            <span className="font-semibold">{t('nav.dashboard')}</span>
          </Link>

          {navItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href={item.id}
                className={`sasi-nav-item ${isActive(item.id) ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="shrink-0 p-2 border-t border-[var(--surface-glass-border)]" ref={settingsRef}>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`sasi-nav-item w-full ${pathname.startsWith('/admin') ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>{t('nav.settings')}</span>
          </button>
          {settingsOpen && (
            <div className="absolute bottom-full left-2 mb-2 w-56 bg-card border border-border rounded-xl shadow-xl p-3 z-50 animate-dropdownIn origin-bottom">
              <div className="text-xs text-muted-foreground mb-2">{t('settings.theme')}</div>
              <div className="flex rounded-lg bg-inset p-0.5 relative">
                <div
                  className="absolute h-[calc(100%-4px)] top-0.5 rounded-md bg-card shadow-sm transition-transform duration-200"
                  style={{ width: '50%', transform: `translateX(${isDark ? '100%' : '0%'})` }}
                />
                <button
                  onClick={() => { if (isDark) toggle(); setSettingsOpen(false) }}
                  className="relative z-10 flex-1 h-8 text-xs font-medium rounded-md transition-colors"
                >
                  Light
                </button>
                <button
                  onClick={() => { if (!isDark) toggle(); setSettingsOpen(false) }}
                  className="relative z-10 flex-1 h-8 text-xs font-medium rounded-md transition-colors"
                >
                  Dark
                </button>
              </div>

              <div className="h-px bg-border my-3" />

              <div className="text-xs text-muted-foreground mb-2">{t('settings.language')}</div>
              <div className="flex rounded-lg bg-inset p-0.5 relative">
                <div
                  className="absolute h-[calc(100%-4px)] top-0.5 rounded-md bg-card shadow-sm transition-transform duration-200"
                  style={{ width: `${100 / languages.length}%`, transform: `translateX(${languages.findIndex(l => l.code === lang) * 100}%)` }}
                />
                {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setSettingsOpen(false) }}
                    className="relative z-10 flex-1 h-8 text-xs font-medium rounded-md transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-md ml-48">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 gap-1 sm:gap-1.5">
          {/* Search */}
          <div className="hidden sm:flex items-center">
            <GlobalSearch />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* App count */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface text-xs text-muted-foreground whitespace-nowrap">
              <Smartphone size={12} />
              <span className="font-semibold text-foreground">{apps.length}</span>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="header-icon-btn"
              >
                <Bell size={13} />
                {(unread?.count || 0) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-[8px] font-bold flex items-center justify-center text-white">
                    {unread!.count > 9 ? '9+' : unread!.count}
                  </span>
                )}
              </button>
              {notifOpen && (
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
                        {t('notifications.empty')}
                      </div>
                    ) : (
                      notifList.map(n => {
                        const { icon: NIcon, color } = notifIcon(n.type)
                        return (
                          <Link
                            key={n.id}
                            href={n.appId ? `/apps/${n.appId}` : '/notifications'}
                            onClick={() => setNotifOpen(false)}
                            className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.04] ${!n.read ? 'bg-slate-50 dark:bg-white/[0.02]' : ''}`}
                          >
                            <NIcon size={15} className={`shrink-0 mt-0.5 ${color}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-foreground/90 truncate">{n.title}</p>
                              <p className="text-xs text-muted-foreground/70 mt-0.5">{new Date(n.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'pt-BR')}</p>
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
                      className="block text-center text-xs text-blue-400 py-3 border-t border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    >
                      {t('notifications.viewAll')}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border border-border bg-inset/50 hover:bg-inset transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-full bg-transparent flex items-center justify-center text-muted-foreground shrink-0">
                  <User size={15} />
                </div>
                <span className="hidden sm:inline text-xs text-muted-foreground">{display}</span>
                <ChevronDown size={10} className={`text-muted-foreground transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50">
                  <div className="px-4 py-2.5 text-xs text-muted-foreground border-b border-border mb-1">{user.email}</div>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-inset transition"
                    onClick={() => { setProfileOpen(false); setShowPasswordModal(true) }}
                  >
                    <Lock size={15} className="text-muted-foreground" />
                    {t('profile.changePassword')}
                  </button>
                  <div className="h-px bg-border mx-3 my-1" />
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition"
                    onClick={() => { setProfileOpen(false); logout(); router.push('/login') }}
                  >
                    <LogOut size={15} />
                    {t('profile.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="ml-48">
        <div className="max-w-[1440px] px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  )
}
