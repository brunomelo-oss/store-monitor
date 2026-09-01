import { memo } from 'react'
import { CheckCircle2, XCircle, Clock, RefreshCw, Ban, AlertTriangle } from 'lucide-react'
import type { SyncJobStatus } from '@/lib/types'

const STATUS_MAP: Record<SyncJobStatus, { label: string; icon: React.ReactNode; className: string }> = {
  SUCCESS: { label: 'Sucesso', icon: <CheckCircle2 size={12} />, className: 'text-emerald-500 bg-emerald-500/10' },
  FAILED: { label: 'Falhou', icon: <XCircle size={12} />, className: 'text-red-500 bg-red-500/10' },
  PENDING: { label: 'Pendente', icon: <Clock size={12} />, className: 'text-yellow-500 bg-yellow-500/10' },
  RUNNING: { label: 'Executando', icon: <RefreshCw size={12} className="animate-spin" />, className: 'text-blue-500 bg-blue-500/10' },
  IGNORED: { label: 'Ignorado', icon: <Ban size={12} />, className: 'text-muted-foreground bg-surface' },
  PARTIAL: { label: 'Parcial', icon: <AlertTriangle size={12} />, className: 'text-yellow-500 bg-yellow-500/10' },
}

export const StatusBadge = memo(function StatusBadge({ status }: { status: SyncJobStatus }) {
  const meta = STATUS_MAP[status]
  if (!meta) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${meta.className}`}>
      {meta.icon}
      {meta.label}
    </span>
  )
})