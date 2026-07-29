'use client'

import type { AppDetail } from '@/features/apps/hooks/useAppDetail'
import { DataTable } from '@/components/DataTable'
import { formatLocaleDate } from '@/lib/utils'

export function ReviewsTab({ app }: { app: AppDetail }) {
  const reviews = app.reviews || []
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'author', header: 'Autor', render: (r) => <span className="font-medium">{r.author}</span> },
          { key: 'score', header: 'Nota', render: (r) => <span className="text-yellow-400">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span> },
          { key: 'title', header: 'Título', render: (r) => r.title || '—', className: 'max-w-[200px] truncate' },
          { key: 'content', header: 'Conteúdo', render: (r) => r.content ? <span className="max-w-[300px] truncate block">{r.content}</span> : '—' },
          { key: 'createdAt', header: 'Data', render: (r) => formatLocaleDate(r.createdAt, 'pt-BR', 'date') },
        ]}
        data={reviews}
        keyExtractor={(r) => r.id}
        emptyMessage="Nenhum review encontrado"
      />
    </div>
  )
}
