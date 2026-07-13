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
  Layers, Users, Bell, Moon, Sun, Smartphone, Shield,
  CheckCheck, XCircle, CheckCircle, MessageSquare, RefreshCw,
  Languages, Settings, LogOut, Lock, ChevronDown,
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
  const { lang, setLang } = useLang()
  const { data: unread } = useUnreadCount()
  const { data: notifList = [] } = useNotifications(5)
  const markAllMutation = useMarkAllAsRead()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

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

  const isAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN'
  const navItems = [
    { id: '/apps', label: 'Apps', icon: Layers },
    { id: '/admin', label: 'Usuários', icon: Users },
    ...(isAdmin ? [{ id: '/admin/connections', label: 'Sistema', icon: Shield }] : []),
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

  const initial = user.email.charAt(0).toUpperCase()
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
      <aside className="fixed left-0 top-0 h-full w-48 z-30 border-r border-border bg-background flex flex-col">
        {/* Profile */}
        <div ref={profileRef} className="relative shrink-0">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 w-full px-3 h-14 border-b border-border hover:bg-surface transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-700 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
              {initial}
            </div>
            <div className="flex flex-col min-w-0 text-left flex-1">
              <span className="text-xs text-foreground font-medium truncate">{display}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{user.role?.toLowerCase()}</span>
            </div>
            <ChevronDown size={12} className={`text-zinc-500 shrink-0 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute left-2 right-2 top-full mt-1 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50">
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-inset transition"
                onClick={() => { setProfileOpen(false); setShowPasswordModal(true) }}
              >
                <Lock size={15} className="text-muted-foreground" />
                Alterar senha
              </button>
              <div className="h-px bg-border mx-3 my-1" />
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                onClick={() => { setProfileOpen(false); logout(); router.push('/login') }}
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pt-3 space-y-0.5 overflow-y-auto">
          {/* Dashboard with logo */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-inset text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[url('/assets/logo-sasi-white.png')] bg-center bg-contain bg-no-repeat shrink-0" />
            <span>Dashboard</span>
          </Link>

          {navItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href={item.id}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.id)
                    ? 'bg-inset text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="shrink-0 p-2 border-t border-border">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            <Settings size={20} />
            <span>Configurações</span>
          </Link>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-md ml-48">
        <div className="flex items-center justify-end h-14 px-4 sm:px-6 gap-1 sm:gap-1.5">
          {/* Search */}
          <div className="hidden sm:flex items-center mr-auto">
            <GlobalSearch />
          </div>

          {/* App count */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface text-xs text-muted-foreground whitespace-nowrap">
            <Smartphone size={12} />
            <span className="font-semibold text-foreground">{apps.length}</span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
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
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-sm font-medium text-foreground">Notificações</span>
                  <div className="flex items-center gap-2">
                    {(unread?.count || 0) > 0 && (
                      <button
                        onClick={() => markAllMutation.mutate()}
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1"
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
                          className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04] ${!n.read ? 'bg-white/[0.02]' : ''}`}
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
                    className="block text-center text-xs text-blue-400 py-3 border-t border-white/10 hover:bg-white/[0.04]"
                  >
                    Ver todas as notificações
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
          >
            <div className="transition-transform duration-300 hover:scale-110 active:scale-90 flex items-center justify-center">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </div>
          </button>

          {/* Language toggle */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
            >
              <Languages size={14} />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50 transition-all duration-150">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false) }}
                      className={`w-full h-10 px-4 text-left text-sm flex items-center justify-between transition-colors ${lang === l.code ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-inset'}`}
                    >
                      {l.label}
                      {lang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-sasi-red" />}
                    </button>
                  ))}
                </div>
              </>
            )}
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
