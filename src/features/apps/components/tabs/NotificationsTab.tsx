'use client'

import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { Spinner } from '@/components/LoadingSkeleton'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable } from '@/components/DataTable'
import { CheckCircle, Clock } from 'lucide-react'

export function NotificationsTab({ appId }: { appId: number }) {
  const { data: notifications, isLoading } = useNotifications(50)
  const appNotifs = (notifications || []).filter(n => n.appId === appId)

  if (isLoading) return <Spinner />
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'type', header: 'Tipo', render: (n) => <StatusBadge status={n.type} /> },
          { key: 'title', header: 'Título', render: (n) => <span className="font-medium">{n.title}</span> },
          { key: 'message', header: 'Mensagem', render: (n) => n.message, className: 'max-w-[300px] truncate' },
          { key: 'read', header: 'Lida', render: (n) => n.read ? <CheckCircle size={14} className="text-green-500" /> : <Clock size={14} className="text-yellow-500" /> },
          { key: 'createdAt', header: 'Data', render: (n) => new Date(n.createdAt).toLocaleString('pt-BR') },
        ]}
        data={appNotifs}
        keyExtractor={(n) => n.id}
        emptyMessage="Nenhuma notificação para este app"
      />
    </div>
  )
}
