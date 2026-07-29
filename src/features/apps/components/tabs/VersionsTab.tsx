'use client'

import type { AppDetail } from '@/features/apps/hooks/useAppDetail'
import { MetricCard } from '@/components/MetricCard'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable } from '@/components/DataTable'
import { formatLocaleDate } from '@/lib/utils'
import { Package, CheckCircle, Globe, Apple } from 'lucide-react'

export function VersionsTab({ app }: { app: AppDetail }) {
  const versions = app.versions || []
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard title="Total" value={versions.length} icon={<Package size={16} />} />
        <MetricCard title="Publicadas" value={versions.filter((v) => v.status === 'PUBLISHED').length} variant="success" icon={<CheckCircle size={16} />} />
      </div>
      <DataTable
        columns={[
          { key: 'version', header: 'Versão', render: (v) => <span className="font-medium">{v.version || v.versionId}</span> },
          { key: 'store', header: 'Loja', render: (v) => v.store === 'GOOGLE' ? <span className="flex items-center gap-1"><Globe size={12} />Google Play</span> : <span className="flex items-center gap-1"><Apple size={12} />App Store</span> },
          { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
          { key: 'buildNumber', header: 'Build', render: (v) => v.buildNumber || '—' },
          { key: 'createdAt', header: 'Criado em', render: (v) => formatLocaleDate(v.createdAt) },
        ]}
        data={versions}
        keyExtractor={(v) => v.id}
        emptyMessage="Nenhuma versão registrada"
      />
    </div>
  )
}
