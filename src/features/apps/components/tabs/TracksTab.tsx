'use client'

import type { AppDetail } from '@/features/apps/hooks/useAppDetail'
import { DataTable } from '@/components/DataTable'

export function TracksTab({ app }: { app: AppDetail }) {
  const tracks = app.tracks || []
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'name', header: 'Track', render: (t) => <span className="font-medium">{t.name}</span> },
          { key: 'fraction', header: 'Frações', render: (t) => t.fraction || '100%' },
        ]}
        data={tracks}
        keyExtractor={(t) => t.id}
        emptyMessage="Nenhum track encontrado"
      />
    </div>
  )
}
