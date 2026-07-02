'use client'

import { useState } from 'react'
import { App } from '@/types'
import { useAppContext } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { SearchBar } from './SearchBar'
import { ModeToggle } from './ModeToggle'
import { AppGrid } from './AppGrid'
import { AppModal } from './AppModal'
import { Plus } from 'lucide-react'

export function AppsView() {
  const { apps, mode, setMode } = useAppContext()
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ app: App | null; mode: 'edit' | 'add' | 'details'; region: string } | null>(null)

  const q = search.toLowerCase().trim()
  const filtered = q ? apps.filter(a => a.name.toLowerCase().includes(q)) : apps

  const brasil = filtered.filter(a => a.region === 'Brasil')
  const internacional = filtered.filter(a => a.region === 'Internacional')

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex items-center gap-3">
          <ModeToggle mode={mode} onChange={setMode} show={isAdmin} />
          {isAdmin && mode === 'edit' && (
            <div className="flex gap-2">
              <button
                onClick={() => setModal({ app: null, mode: 'add', region: 'Brasil' })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition"
              >
                <Plus size={16} />
                Brasil
              </button>
              <button
                onClick={() => setModal({ app: null, mode: 'add', region: 'Internacional' })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition"
              >
                <Plus size={16} />
                Internacional
              </button>
            </div>
          )}
        </div>
      </div>

      <AppGrid
        apps={brasil}
        region="Apps Brasil"
        badge="Nacional"
        onEdit={a => setModal({ app: a, mode: 'edit', region: a.region })}
        onDetails={a => setModal({ app: a, mode: 'details', region: a.region })}
      />
      <AppGrid
        apps={internacional}
        region="Apps Internacional"
        badge="Dubai"
        badgeClass="bg-blue-500/10 text-blue-400"
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
