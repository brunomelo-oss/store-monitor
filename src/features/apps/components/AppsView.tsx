'use client'

import { useState } from 'react'
import { useApps } from '@/hooks/useApps'
import { useLang } from '@/contexts/LanguageContext'
import { SearchBar } from './SearchBar'
import { AppGrid } from './AppGrid'
import { InconformitiesStrip } from './InconformitiesStrip'
import { hasIssues } from '@/lib/utils'

export function AppsView() {
  const { t } = useLang()
  const { data: apps = [] } = useApps()
  const [search, setSearch] = useState('')

  const q = search.toLowerCase().trim()

  const withIssues = apps.filter(a => hasIssues(a))
  const normal = apps.filter(a => !hasIssues(a))

  const sortedNormal = [...normal].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return (a.sortOrder || 0) - (b.sortOrder || 0)
  })
  const filteredIssues = q ? withIssues.filter(a => a.name.toLowerCase().includes(q)) : withIssues
  const filteredNormal = q ? sortedNormal.filter(a => a.name.toLowerCase().includes(q)) : sortedNormal

  const brasil = filteredNormal.filter(a => a.region === 'Brasil')
  const internacional = filteredNormal.filter(a => a.region === 'Internacional')

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <InconformitiesStrip apps={filteredIssues} />

      <AppGrid
        apps={brasil}
        region={t('appsView.sectionBrasil')}
        badge={t('appsView.badgeBrasil')}
      />
      <AppGrid
        apps={internacional}
        region={t('appsView.sectionInternacional')}
        badge={t('appsView.badgeInternacional')}
        badgeClass="bg-blue-500/10 text-blue-400"
      />
    </div>
  )
}