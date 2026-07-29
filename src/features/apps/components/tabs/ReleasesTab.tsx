'use client'

import type { AppDetail } from '@/features/apps/hooks/useAppDetail'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable } from '@/components/DataTable'

export function ReleasesTab({ app }: { app: AppDetail }) {
  const releases = app.releases || app.publications || []
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'store', header: 'Loja', render: (r) => r.store === 'GOOGLE' ? 'Google Play' : 'App Store' },
          { key: 'submittedAt', header: 'Submetido', render: (r) => r.submittedAt ? new Date(r.submittedAt).toLocaleString('pt-BR') : '—' },
          { key: 'publishedAt', header: 'Publicado', render: (r) => r.publishedAt ? new Date(r.publishedAt).toLocaleString('pt-BR') : '—' },
          { key: 'rejectionReason', header: 'Motivo rejeição', render: (r) => r.rejectionReason || '—', className: 'text-red-500 max-w-[200px] truncate' },
        ]}
        data={releases}
        keyExtractor={(r) => r.id}
        emptyMessage="Nenhum release encontrado"
      />
    </div>
  )
}
