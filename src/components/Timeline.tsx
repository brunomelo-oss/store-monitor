import { Fragment } from 'react'
import { Clock, RefreshCw, CheckCircle, XCircle, UserPlus, Mail, LogIn, LogOut, Key, Star, MessageSquare, Upload, FileText, Bell, Terminal, type LucideIcon } from 'lucide-react'

interface TimelineEvent {
  id: string
  type: string
  description: string
  timestamp: string
  username?: string | null
  metadata?: Record<string, unknown> | null
}

const actionIcons: Record<string, LucideIcon> = {
  'CREATE_APP': FileText,
  'UPDATE_APP': FileText,
  'DELETE_APP': XCircle,
  'TOGGLE_PIN_APP': Star,
  'MOVE_APP': RefreshCw,
  'BULK_REPLACE_APPS': RefreshCw,
  'SIGN_IN': LogIn,
  'SIGN_OUT': LogOut,
  'CHANGE_PASSWORD': Key,
  'INVITE_USER': UserPlus,
  'CREATE_USER': UserPlus,
  'JOB_COMPLETED': CheckCircle,
  'JOB_FAILED': XCircle,
  'sync.success': CheckCircle,
  'sync.failed': XCircle,
  'sync.pending': Clock,
  'sync.running': RefreshCw,
  'notification.new_version': Bell,
  'notification.review_completed': MessageSquare,
  'notification.rejection': XCircle,
  'notification.sync_failure': XCircle,
  'job.success': CheckCircle,
  'job.failed': XCircle,
  'job.pending': Clock,
}

function getIcon(type: string): LucideIcon {
  const key = Object.keys(actionIcons).find(k => type.includes(k))
  return key ? actionIcons[key] : Terminal
}

const typeColors: Record<string, string> = {
  audit_log: 'border-l-blue-500',
  sync: 'border-l-green-500',
  notification: 'border-l-yellow-500',
  job: 'border-l-purple-500',
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 7) return `${days}d atrás`
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum evento registrado
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-0">
        {events.map((event, idx) => {
          const Icon = getIcon(event.type)
          const color = typeColors[event.type] || 'border-l-zinc-500'

          return (
            <Fragment key={event.id}>
              {idx > 0 && new Date(event.timestamp).toDateString() !== new Date(events[idx - 1].timestamp).toDateString() && (
                <div className="relative pl-10 py-2">
                  <span className="text-xs text-muted-foreground bg-background px-2">
                    {new Date(event.timestamp).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
              )}
              <div className={`relative pl-10 pb-4 border-l-2 ${color} last:border-transparent ml-4`}>
                <div className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-background border-2 border-border flex items-center justify-center">
                  <Icon size={10} className="text-muted-foreground" />
                </div>
                <div className="text-sm">{event.description}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{formatTimeAgo(event.timestamp)}</span>
                  {event.username && <><span>·</span><span>{event.username}</span></>}
                </div>
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
