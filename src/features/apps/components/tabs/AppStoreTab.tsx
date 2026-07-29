'use client'

import type { AppDetail } from '@/features/apps/hooks/useAppDetail'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable } from '@/components/DataTable'

export function AppStoreTab({ app }: { app: AppDetail }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">Informações</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Bundle ID</span><span className="font-mono">{app.bundleId || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={app.appStatus || '—'} size="md" /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Versão</span><span>{app.appVersion || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Conta</span><span>{app.appleAccount || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Última atualização</span><span>{app.appLastUpdate ? new Date(app.appLastUpdate).toLocaleString('pt-BR') : '—'}</span></div>
          </div>
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Versões</h3>
        <DataTable
          columns={[
            { key: 'version', header: 'Versão', render: (v) => v.version || v.versionId },
            { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status || '—'} /> },
            { key: 'buildNumber', header: 'Build', render: (v) => v.buildNumber || '—' },
            { key: 'createdAt', header: 'Criado em', render: (v) => v.createdAt ? new Date(v.createdAt).toLocaleDateString('pt-BR') : '—' },
          ]}
          data={app.versions?.filter((v) => v.store === 'APPLE') || []}
          keyExtractor={(v) => v.id}
          emptyMessage="Nenhuma versão encontrada"
        />
      </div>
    </div>
  )
}
