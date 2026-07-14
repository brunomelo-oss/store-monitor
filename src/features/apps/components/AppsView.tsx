'use client'

import { useState } from 'react'
import { App } from '@/types'
import { useApps } from '@/hooks/useApps'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { SearchBar } from './SearchBar'
import { ModeToggle } from './ModeToggle'
import { AppGrid } from './AppGrid'
import { AppModal } from './AppModal'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export function AppsView() {
  const { t } = useLang()
  const { data: apps = [] } = useApps()
  const { isAdmin } = useAuth()
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ app: App | null; mode: 'edit' | 'add' | 'details'; region: string } | null>(null)

  const q = search.toLowerCase().trim()
  const sorted = [...apps].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return (a.sortOrder || 0) - (b.sortOrder || 0)
  })
  const filtered = q ? sorted.filter(a => a.name.toLowerCase().includes(q)) : sorted

  const brasil = filtered.filter(a => a.region === 'Brasil')
  const internacional = filtered.filter(a => a.region === 'Internacional')

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex items-center gap-3">
          <Link
            href="/apps/new"
            className="sasi-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm shadow-sm"
          >
            <Plus size={15} /> Novo aplicativo
          </Link>
          <ModeToggle mode={mode} onChange={setMode} show={isAdmin} />
        </div>
      </div>

      <AppGrid
        apps={brasil}
        region={t('appsView.sectionBrasil')}
        badge={t('appsView.badgeBrasil')}
        mode={mode}
        onEdit={a => setModal({ app: a, mode: 'edit', region: a.region })}
        onDetails={a => setModal({ app: a, mode: 'details', region: a.region })}
      />
      <AppGrid
        apps={internacional}
        region={t('appsView.sectionInternacional')}
        badge={t('appsView.badgeInternacional')}
        badgeClass="bg-blue-500/10 text-blue-400"
        mode={mode}
        onEdit={a => setModal({ app: a, mode: 'edit', region: a.region })}
        onDetails={a => setModal({ app: a, mode: 'details', region: a.region })}
      />

      {modal && (
        <AppModal
          app={modal.app}
          mode={modal.mode}
          region={modal.region}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
