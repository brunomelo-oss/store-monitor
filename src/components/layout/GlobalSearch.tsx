'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApps } from '@/hooks/useApps'
import { useLang } from '@/contexts/LanguageContext'
import { Search, Command, ChevronRight, FileText, BarChart3, Layers, Activity, Bell, Settings, Plus, UserPlus, Download, Users, Globe, type LucideIcon } from 'lucide-react'

interface SearchResult {
  type: 'page' | 'action' | 'app' | 'settings'
  id: string
  label: string
  href?: string
  icon: LucideIcon
  badge?: string
}

export function GlobalSearch() {
  const router = useRouter()
  const { t } = useLang()
  const { data: apps = [] } = useApps()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)

  const searchPages: Omit<SearchResult, 'badge'>[] = [
    { id: '/', label: t('search.dashboard'), icon: BarChart3, type: 'page' },
    { id: '/apps', label: t('nav.apps'), icon: Layers, type: 'page' },
    { id: '/activity', label: t('search.activities'), icon: Activity, type: 'page' },
    { id: '/notifications', label: t('notifications.title'), icon: Bell, type: 'page' },
    { id: '/admin/connections', label: t('search.connections'), icon: Settings, type: 'page' },
  ]

  const searchActions: Omit<SearchResult, 'badge'>[] = [
    { id: 'create-app', label: t('search.newApp'), icon: Plus, type: 'action' },
    { id: 'create-user', label: t('search.newUser'), icon: UserPlus, type: 'action' },
    { id: 'export', label: t('search.exportData'), icon: Download, type: 'action' },
  ]

  const searchSettings: Omit<SearchResult, 'badge'>[] = [
    { id: 'manage-users', label: t('search.manageUsers'), icon: Users, type: 'settings' },
    { id: 'connections', label: t('search.connections'), icon: Globe, type: 'settings' },
    { id: 'activity', label: t('search.activityLog'), icon: Activity, type: 'settings' },
  ]

  const q = query.toLowerCase().trim()

  const results = useMemo(() => {
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
      .map(({ score: _, ...rest }) => rest)

    const actions: SearchResult[] = searchActions
      .map(a => ({ ...a, type: 'action' as const, score: score(a.label) }))
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score: _, ...rest }) => rest)

    const appResults: SearchResult[] = (apps || [])
      .map(a => ({
        type: 'app' as const, id: String(a.id), label: a.name,
        href: `/apps/${a.id}`, icon: FileText,
        badge: (a.playStatus || a.appStatus) ?? undefined,
        score: score(a.name),
      }))
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score: _, ...rest }) => rest)

    const settings: SearchResult[] = searchSettings
      .map(s => ({ ...s, type: 'settings' as const, score: score(s.label) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score: _, ...rest }) => rest)

    return [...pages, ...actions, ...appResults, ...settings]
  }, [q, apps, t])

  useEffect(() => { setSelectedIdx(0) }, [query])

  const execute = useCallback((item: any) => {
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

  const showDropdown = focused && query.length > 0

  return (
    <div className="relative w-full max-w-[340px] xl:max-w-[420px]">
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.04] backdrop-blur-xl border border-border rounded-xl px-3 py-1.5 transition-all duration-200 focus-within:border-foreground/20 focus-within:bg-slate-200 dark:focus-within:bg-white/[0.07]">
        <Search size={14} className="text-muted-foreground/40 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={t('search.placeholder')}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50 min-w-0"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded border border-border text-muted-foreground/40">
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
              <div className="text-center py-6 text-sm text-muted-foreground/60">
                {t('search.noResults')} &ldquo;<span className="text-foreground/80">{query}</span>&rdquo;
              </div>
            )}

            {results.map((item, idx) => {
              const Icon = item.icon
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                    selectedIdx === idx
                      ? 'bg-slate-200 dark:bg-white/[0.08] text-foreground'
                      : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-foreground'
                  }`}
                  onClick={() => execute(item)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                >
                  <Icon size={15} className="shrink-0 text-muted-foreground/40" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-inset text-muted-foreground/60">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={13} className="shrink-0 text-muted-foreground/20" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
