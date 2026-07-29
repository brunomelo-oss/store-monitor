'use client'

import type { AppDetail } from '@/features/apps/hooks/useAppDetail'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { formatLocaleDate } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

export function BuildsTab({ app }: { app: AppDetail }) {
  const builds = app.builds || []
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'buildNumber', header: 'Build', render: (b) => <span className="font-mono">{b.buildNumber}</span> },
          { key: 'store', header: 'Loja', render: (b) => b.store === 'GOOGLE' ? 'Google Play' : 'App Store' },
          { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
          { key: 'createdAt', header: 'Criado em', render: (b) => formatLocaleDate(b.createdAt) },
          { key: 'artifactUrl', header: '', render: (b) => b.artifactUrl ? <a href={b.artifactUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs"><ExternalLink size={14} /></a> : '—' },
        ]}
        data={builds}
        keyExtractor={(b) => b.id}
        emptyMessage="Nenhum build encontrado"
      />
    </div>
  )
}
