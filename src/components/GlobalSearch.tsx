'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Command, ChevronRight, Globe, Apple, FileText, Settings, Activity, BarChart3, HeartPulse, Bell, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react'
import { useApps } from '@/hooks/useApps'

const pages = [
  { id: '/', label: 'Dashboard', icon: BarChart3 },
  { id: '/apps', label: 'Apps', icon: Globe },
  { id: '/sync', label: 'Sincronização', icon: RefreshCw },
  { id: '/notifications', label: 'Notificações', icon: Bell },
  { id: '/activity', label: 'Atividade', icon: Activity },
  { id: '/health', label: 'Saúde do Sistema', icon: HeartPulse },
  { id: '/admin/connections', label: 'Conexões', icon: Settings },
]

const actions = [
  { id: 'trigger-sync', label: 'Iniciar sincronização', icon: RefreshCw },
  { id: 'view-health', label: 'Ver saúde do sistema', icon: HeartPulse, href: '/health' },
  { id: 'view-activity', label: 'Ver feed de atividade', icon: Activity, href: '/activity' },
]

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router = useRouter()
  const { data: apps } = useApps()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const q = query.toLowerCase()

  const filteredPages = pages.filter(p => p.label.toLowerCase().includes(q))
  const filteredApps = (apps || []).filter(a => a.name.toLowerCase().includes(q))
  const filteredActions = actions.filter(a => a.label.toLowerCase().includes(q))

  const allResults = [
    ...filteredPages.map(p => ({ type: 'page' as const, id: p.id, label: p.label, icon: p.icon, href: p.id })),
    ...filteredActions.map(a => ({ type: 'action' as const, id: a.id, label: a.label, icon: a.icon, href: a.href })),
    ...filteredApps.map(a => ({ type: 'app' as const, id: a.id, label: a.name, icon: Globe as typeof Globe, href: `/apps/${a.id}` })),
  ]

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, allResults.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && allResults[selectedIdx]) {
        const item = allResults[selectedIdx]
        if (item.type === 'action' && item.id === 'trigger-sync') {
          router.push('/sync')
        } else if (item.href) {
          router.push(item.href)
        }
        onClose()
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, selectedIdx, allResults, router, onClose])

  if (!open) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg bg-zinc-900 border rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar apps, páginas, ações..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded border text-muted-foreground">
            <Command size={12} />K
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredPages.length > 0 && (
            <>
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Páginas</p>
              {filteredPages.map((item, idx) => {
                const i = allResults.indexOf(item as any)
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${selectedIdx === i ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
                    onClick={() => { router.push(item.id); onClose() }}
                    onMouseEnter={() => setSelectedIdx(i)}
                  >
                    <Icon size={16} className="text-muted-foreground" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </button>
                )
              })}
            </>
          )}

          {filteredActions.length > 0 && (
            <>
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground pt-2">Ações</p>
              {filteredActions.map((item, idx) => {
                const i = allResults.indexOf(item as any)
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${selectedIdx === i ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
                    onClick={() => { if (item.href) { router.push(item.href); onClose() } }}
                    onMouseEnter={() => setSelectedIdx(i)}
                  >
                    <Icon size={16} className="text-muted-foreground" />
                    <span className="flex-1">{item.label}</span>
                  </button>
                )
              })}
            </>
          )}

          {filteredApps.length > 0 && (
            <>
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground pt-2">Apps</p>
              {filteredApps.map((app, idx) => {
                const i = allResults.indexOf({ type: 'app', ...app } as any)
                return (
                  <button
                    key={app.id}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${selectedIdx === i ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
                    onClick={() => { router.push(`/apps/${app.id}`); onClose() }}
                    onMouseEnter={() => setSelectedIdx(i)}
                  >
                    <FileText size={16} className="text-muted-foreground" />
                    <span className="flex-1">{app.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); copyToClipboard(app.name) }}
                      className="p-1 rounded hover:bg-zinc-700"
                    >
                      {copied === app.name ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-muted-foreground" />}
                    </button>
                  </button>
                )
              })}
            </>
          )}

          {allResults.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhum resultado para "{query}"
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border text-[10px]">↑↓</kbd> Navegar</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border text-[10px]">↵</kbd> Selecionar</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border text-[10px]">Esc</kbd> Fechar</span>
        </div>
      </div>
    </div>
  )
}
