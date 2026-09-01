'use client'

import { useState } from 'react'
import { useApps } from '@/hooks/useApps'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { useModal } from '@/contexts/ModalContext'
import { SearchBar } from './SearchBar'
import { ModeToggle } from './ModeToggle'
import { AppGrid } from './AppGrid'
import { AppModal } from './AppModal'
import { Plus } from 'lucide-react'

export function AppsView() {
  const { t } = useLang()
  const { data: apps = [] } = useApps()
  const { isAdmin } = useAuth()
  const { open } = useModal()
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [search, setSearch] = useState('')

  const q = search.toLowerCase().trim()
  const sorted = [...apps].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return (a.sortOrder || 0) - (b.sortOrder || 0)
  })
  const filtered = q ? sorted.filter(a => a.name.toLowerCase().includes(q)) : sorted

  const brasil = filtered.filter(a => a.region === 'Brasil')
  const internacional = filtered.filter(a => a.region === 'Internacional')

  const openAdd = (region: 'Brasil' | 'Internacional') =>
    open({
      title: `${t('search.newApp')} · ${region}`,
      content: <AppModal mode="add" region={region} />,
    })

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAdd('Brasil')}
            className="sasi-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm shadow-sm"
          >
            <Plus size={15} /> {t('search.newApp')}
          </button>
          <ModeToggle mode={mode} onChange={setMode} show={isAdmin} />
        </div>
      </div>

      <AppGrid
        apps={brasil}
        region={t('appsView.sectionBrasil')}
        badge={t('appsView.badgeBrasil')}
        mode={mode}
        onEdit={a => open({ title: t('appModal.title.edit'), content: <AppModal app={a} mode="edit" region={a.region} /> })}
      />
      <AppGrid
        apps={internacional}
        region={t('appsView.sectionInternacional')}
        badge={t('appsView.badgeInternacional')}
        badgeClass="bg-blue-500/10 text-blue-400"
        mode={mode}
        onEdit={a => open({ title: t('appModal.title.edit'), content: <AppModal app={a} mode="edit" region={a.region} /> })}
      />
    </div>
  )
}