'use client'

import { Suspense, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { MetricCard } from '@/components/MetricCard'
import { useApps } from '@/hooks/useApps'
import { useSyncHistory } from '@/features/sync/hooks/useSyncHistory'
import { useActivity } from '@/features/activity/hooks/useActivity'
import { Spinner } from '@/components/LoadingSkeleton'
import {
  Smartphone, CheckCircle, XCircle, Clock,
  RefreshCw, Globe, Apple, Edit, ArrowRight,
  Search, Command, FileText, Settings, BarChart3,
  Activity, Bell, HeartPulse, Layers, Users,
  UserPlus, Mail, CheckCheck, Download,
  ChevronRight, Lock, User,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function DashboardView() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className="space-y-8">
        <ErrorBoundary><CommandCenter /></ErrorBoundary>
      </div>
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-white/[0.04]" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-64 rounded-xl bg-white/[0.04]" />
        <div className="h-64 rounded-xl bg-white/[0.04]" />
      </div>
    </div>
  )
}

interface SearchResult {
  type: 'page' | 'action' | 'app' | 'settings'
  id: string
  label: string
  href?: string
  icon: typeof Search
  badge?: string
}

const searchPages = [
  { id: '/', label: 'Dashboard', icon: BarChart3 },
  { id: '/apps', label: 'Apps', icon: Layers },
  { id: '/sync', label: 'Sincronização', icon: RefreshCw },
  { id: '/notifications', label: 'Notificações', icon: Bell },
  { id: '/activity', label: 'Atividade', icon: Activity },
  { id: '/admin/connections', label: 'Conexões', icon: Settings },
]

const searchActions = [
  { id: 'trigger-sync', label: 'Iniciar sincronização', icon: RefreshCw, href: '/sync' },
  { id: 'create-user', label: 'Criar usuário', icon: UserPlus, href: '/admin' },
  { id: 'invite-user', label: 'Convidar usuário', icon: Mail, href: '/admin' },
  { id: 'mark-read', label: 'Marcar notificações como lidas', icon: CheckCheck, href: '/notifications' },
  { id: 'export', label: 'Exportar dados', icon: Download, href: '/apps' },
]

const searchSettings = [
  { id: 'manage-users', label: 'Gerenciar usuários', icon: Users, href: '/admin' },
  { id: 'change-password', label: 'Trocar senha', icon: Lock, href: '/admin' },
  { id: 'edit-profile', label: 'Editar perfil', icon: User, href: '/admin' },
]

function SearchBar() {
  const router = useRouter()
  const { data: apps = [] } = useApps()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)

  const q = query.toLowerCase().trim()

  const results = useMemo<SearchResult[]>(() => {
    if (!q) return []

    const score = (label: string) => {
      const l = label.toLowerCase()
      if (l === q) return 4
      if (l.startsWith(q)) return 3
      if (l.includes(q)) return 2
      return 0
    }

    const pages: SearchResult[] = searchPages
      .map(p => ({ ...p, type: 'page' as const, score: score(p.label) }))
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score: _, ...rest }) => ({ ...rest, icon: rest.icon as typeof Search }))

    const actions: SearchResult[] = searchActions
      .map(a => ({ ...a, type: 'action' as const, score: score(a.label) }))
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score: _, ...rest }) => ({ ...rest, icon: rest.icon as typeof Search }))

    const appResults: SearchResult[] = (apps || [])
      .map(a => ({ type: 'app' as const, id: String(a.id), label: a.name, href: `/apps/${a.id}`, icon: FileText as typeof FileText, badge: (a.playStatus || a.appStatus) ?? undefined, score: score(a.name) }))
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score: _, ...rest }) => rest)

    const settings: SearchResult[] = searchSettings
      .map(s => ({ ...s, type: 'settings' as const, score: score(s.label) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score: _, ...rest }) => ({ ...rest, icon: rest.icon as typeof Search }))

    return [...pages, ...actions, ...appResults, ...settings]
  }, [q, apps])

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  const execute = useCallback((item: SearchResult) => {
    if (item.href) router.push(item.href)
    setQuery('')
    setFocused(false)
    inputRef.current?.blur()
  }, [router])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setFocused(true)
        return
      }
      if (!focused) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && results[selectedIdx]) { e.preventDefault(); execute(results[selectedIdx]) }
      if (e.key === 'Escape') { setFocused(false); setQuery(''); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focused, selectedIdx, results, execute])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setFocused(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const showDropdown = focused && (query.length > 0)

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-xl px-3 py-1.5 transition-all duration-200 focus-within:border-white/20 focus-within:bg-white/[0.07] w-48 focus-within:w-72">
        <Search size={14} className="text-white/40 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Buscar..."
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40 min-w-0"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] rounded border border-white/10 text-white/30">
          <Command size={10} />K
        </kbd>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 glass-dropdown rounded-xl overflow-hidden z-50"
        >
          <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
            {results.length === 0 && (
              <div className="text-center py-6 text-sm text-white/40">
                Nenhum resultado para "<span className="text-white/60">{query}</span>"
              </div>
            )}

            {results.map((item, idx) => {
              const Icon = item.icon
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                    selectedIdx === idx
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
                  }`}
                  onClick={() => execute(item)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                >
                  <Icon size={15} className="shrink-0 text-white/40" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={13} className="shrink-0 text-white/20" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function CommandCenter() {
  const { data: apps = [] } = useApps()
  const { data: syncHistory = [] } = useSyncHistory()
  const { data: activity = [] } = useActivity(10)

  const totalApps = apps.length
  const publishedApps = apps.filter(a => a.playStatus === 'PUBLISHED' || a.appStatus === 'PUBLISHED').length
  const inReviewApps = apps.filter(a => a.playStatus === 'REVIEW' || a.appStatus === 'REVIEW').length
  const rejectedApps = apps.filter(a => a.playStatus === 'REJECTED' || a.appStatus === 'REJECTED').length
  const approvalRate = totalApps > 0 ? Math.round((publishedApps / totalApps) * 100) : 0

  const getLastSync = (store: string) => {
    const entries = syncHistory.filter(s => s.store === store)
    if (entries.length === 0) return null
    return entries.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]
  }

  const lastGoogleSync = getLastSync('GOOGLE')
  const lastAppleSync = getLastSync('APPLE')

  const statusCards = [
    {
      label: 'Publicados',
      value: `${publishedApps} de ${totalApps}`,
      icon: Smartphone,
      variant: 'success' as const,
      filter: 'PUBLISHED',
    },
    {
      label: 'Em Revisão',
      value: inReviewApps,
      icon: Clock,
      variant: 'warning' as const,
      filter: 'REVIEW',
    },
    {
      label: 'Rejeitados',
      value: rejectedApps,
      icon: XCircle,
      variant: rejectedApps > 0 ? ('danger' as const) : ('default' as const),
      filter: 'REJECTED',
    },
    {
      label: 'Taxa Aprovação',
      value: `${approvalRate}%`,
      icon: CheckCircle,
      variant: 'info' as const,
    },
  ]

  const activityIcon = (action: string) => {
    const a = action.toUpperCase()
    if (a.includes('BUILD_APPROVED') || a.includes('SUCCESS')) return { icon: CheckCircle, color: 'text-emerald-400' }
    if (a.includes('BUILD_REJECTED') || a.includes('REJECT')) return { icon: XCircle, color: 'text-red-400' }
    if (a.includes('APP_EDITED') || a.includes('UPDATE')) return { icon: Edit, color: 'text-blue-400' }
    if (a.includes('SYNC_OK') || a.includes('SYNC') || a.includes('RUNNING')) return { icon: RefreshCw, color: 'text-emerald-400' }
    return { icon: RefreshCw, color: 'text-zinc-400' }
  }

  if (!apps.length && !syncHistory.length) return <Spinner />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Command Center</h2>
          <p className="text-sm text-white/50">O que precisa de atenção hoje?</p>
        </div>
        <SearchBar />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statusCards.map(card => (
          <Link key={card.label} href={card.filter ? `/apps?status=${card.filter}` : '#'}>
            <MetricCard
              title={card.label}
              value={card.value}
              icon={<card.icon size={16} />}
              variant={card.variant}
            />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-200 hover:bg-white/[0.06]">
          <h3 className="font-semibold text-white mb-4">Últimas Atividades</h3>
          <div className="space-y-3">
            {activity.slice(0, 5).map(a => {
              const { icon: Icon, color } = activityIcon(a.action)
              return (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                    <Icon size={12} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-white/80">{a.description}</p>
                    <p className="text-xs text-white/40">{new Date(a.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              )
            })}
            <Link href="/activity" className="flex items-center gap-1 text-sm text-blue-400 hover:underline pt-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-200 hover:bg-white/[0.06]">
          <h3 className="font-semibold text-white mb-4">Status de Sincronização</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04] border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Globe size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Google Play</p>
                  {lastGoogleSync ? (
                    <p className="text-xs text-white/40">
                      Último sync: {new Date(lastGoogleSync.startedAt).toLocaleString('pt-BR')}
                    </p>
                  ) : (
                    <p className="text-xs text-white/40">Nenhum sync realizado</p>
                  )}
                </div>
              </div>
              {lastGoogleSync ? (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  lastGoogleSync.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                  lastGoogleSync.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {lastGoogleSync.status === 'SUCCESS' ? 'OK' : lastGoogleSync.status === 'FAILED' ? 'Erro' : lastGoogleSync.status}
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/30">—</span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04] border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Apple size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">App Store</p>
                  {lastAppleSync ? (
                    <p className="text-xs text-white/40">
                      Último sync: {new Date(lastAppleSync.startedAt).toLocaleString('pt-BR')}
                    </p>
                  ) : (
                    <p className="text-xs text-white/40">Nenhum sync realizado</p>
                  )}
                </div>
              </div>
              {lastAppleSync ? (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  lastAppleSync.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                  lastAppleSync.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {lastAppleSync.status === 'SUCCESS' ? 'OK' : lastAppleSync.status === 'FAILED' ? 'Erro' : lastAppleSync.status}
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/30">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
