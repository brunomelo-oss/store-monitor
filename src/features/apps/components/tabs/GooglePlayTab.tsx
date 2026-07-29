'use client'

import type { AppDetail } from '@/features/apps/hooks/useAppDetail'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable } from '@/components/DataTable'
import { CheckCircle, XCircle } from 'lucide-react'

export function GooglePlayTab({ app }: { app: AppDetail }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">Informações</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Package Name</span><span className="font-mono">{app.packageName || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={app.playStatus || '—'} size="md" /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Versão</span><span>{app.playVersion || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Conta</span><span>{app.googleAccount || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Última atualização</span><span>{app.playLastUpdate ? new Date(app.playLastUpdate).toLocaleString('pt-BR') : '—'}</span></div>
          </div>
        </div>
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">Store Connection</h3>
          {app.googleStoreConnection ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Conexão</span><span>{app.googleStoreConnection.label || `#${app.googleStoreConnectionId}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ativa</span><span>{app.googleStoreConnection.isActive ? <CheckCircle size={14} className="text-green-500 inline" /> : <XCircle size={14} className="text-red-500 inline" />}</span></div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma conexão configurada</p>
          )}
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
          data={app.versions?.filter((v) => v.store === 'GOOGLE') || []}
          keyExtractor={(v) => v.id}
          emptyMessage="Nenhuma versão encontrada"
        />
      </div>
    </div>
  )
}
