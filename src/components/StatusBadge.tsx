import { CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react'

type StatusType = 'SUCCESS' | 'FAILED' | 'PENDING' | 'RUNNING' | 'IGNORED' | 'PARTIAL'
type StatusVariant = StatusType | string

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  SUCCESS: { icon: CheckCircle, color: 'text-green-500', label: 'Sucesso' },
  FAILED: { icon: XCircle, color: 'text-red-500', label: 'Falha' },
  PENDING: { icon: Clock, color: 'text-yellow-500', label: 'Pendente' },
  RUNNING: { icon: Loader2, color: 'text-blue-500', label: 'Executando' },
  IGNORED: { icon: AlertTriangle, color: 'text-zinc-500', label: 'Ignorado' },
  PARTIAL: { icon: AlertTriangle, color: 'text-orange-500', label: 'Parcial' },
}

export function StatusBadge({ status, size = 'sm' }: { status: StatusVariant; size?: 'sm' | 'md' | 'lg' }) {
  const config = statusConfig[status] || { icon: Clock, color: 'text-zinc-400', label: status }
  const Icon = config.icon
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3 w-3'

  return (
    <span className={`inline-flex items-center gap-1.5 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
      <Icon className={`${sizeClass} ${config.color} ${status === 'RUNNING' ? 'animate-spin' : ''}`} />
      <span className="text-muted-foreground">{config.label}</span>
    </span>
  )
}
