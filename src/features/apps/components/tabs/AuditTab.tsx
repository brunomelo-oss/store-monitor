'use client'

import { type AuditLogItem } from '@/services/audit-logs.service'
import { DataTable } from '@/components/DataTable'
import { formatLocaleDate } from '@/lib/utils'

export function AuditTab({ auditLogs }: { auditLogs: AuditLogItem[] }) {
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'action', header: 'Ação', render: (l) => <span className="font-medium">{l.action}</span> },
          { key: 'user', header: 'Usuário', render: (l) => l.user?.username || l.userId || '—' },
          { key: 'metadata', header: 'Detalhes', render: (l) => l.metadata ? JSON.stringify(l.metadata).slice(0, 80) : '—', className: 'max-w-[200px] truncate text-muted-foreground font-mono text-xs' },
          { key: 'ip', header: 'IP', render: (l) => l.ip || '—', className: 'font-mono text-xs' },
          { key: 'createdAt', header: 'Data', render: (l) => formatLocaleDate(l.createdAt) },
        ]}
        data={auditLogs}
        keyExtractor={(l) => l.id}
        emptyMessage="Nenhum log de auditoria encontrado"
      />
    </div>
  )
}
