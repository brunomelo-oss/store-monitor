'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useApps } from '@/hooks/useApps'
import { useUnreadCount, useNotifications, useMarkAllAsRead } from '@/features/notifications/hooks/useNotifications'
import { ProfileDropdown } from './ProfileDropdown'
import { GlobalSearch } from './GlobalSearch'
import { ChartPie, Layers, Users, Bell, Moon, Sun, Smartphone, Shield, CheckCheck, XCircle, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { isDark, toggle } = useTheme()
  const { data: apps = [] } = useApps()
  const { data: unread } = useUnreadCount()
  const { data: notifList = [] } = useNotifications(5)
  const markAllMutation = useMarkAllAsRead()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    if (notifOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  const isAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN'
  const navItems = [
    { id: '/', label: 'Dashboard', icon: ChartPie },
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-2 sm:gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 mr-1" onDoubleClick={() => {
            if (confirm('Recarregar dados mockados?')) {
              import('@/lib/mock-data').then(m => {
                const { MOCK_APPS } = m
                const fresh = JSON.parse(JSON.stringify(MOCK_APPS))
                import('@/hooks/useApps').then(h => {
                  h.useBulkReplace().mutateAsync(fresh).catch(() => {})
                })
              })
            }
          }}>
            <div className="w-[30px] h-[30px] rounded-lg bg-[url('/assets/logo-sasi-white.png')] bg-center bg-contain bg-no-repeat shrink-0" />
            <span className="text-base font-extrabold tracking-tight leading-none pt-0.5 hidden sm:inline">SASI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  href={item.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(item.id)
                      ? 'bg-inset text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1 min-w-[8px]" />

          {/* Global Search */}
          <div className="hidden sm:flex items-center">
            <GlobalSearch />
          </div>

          {/* Right side icons */}
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

            {/* Profile */}
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
