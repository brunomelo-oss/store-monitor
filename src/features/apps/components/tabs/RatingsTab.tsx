'use client'

import type { AppDetail } from '@/features/apps/hooks/useAppDetail'
import { MetricCard } from '@/components/MetricCard'
import { DataTable } from '@/components/DataTable'
import { Star } from 'lucide-react'

export function RatingsTab({ app }: { app: AppDetail }) {
  const ratings = app.ratings || []
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard title="Rating Atual" value={app.rating ? `${app.rating.toFixed(1)} / 5.0` : '—'} icon={<Star size={16} />} />
        <MetricCard title="Total de Avaliações" value={ratings.length} icon={<Star size={16} />} />
      </div>
      <DataTable
        columns={[
          { key: 'score', header: 'Nota', render: (r) => <span className="text-yellow-400">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span> },
          { key: 'count', header: 'Quantidade', render: (r) => r.count || 1 },
          { key: 'date', header: 'Data', render: (r) => r.date ? new Date(r.date).toLocaleDateString('pt-BR') : '—' },
        ]}
        data={ratings}
        keyExtractor={(r) => r.id}
        emptyMessage="Nenhuma avaliação registrada"
      />
    </div>
  )
}
