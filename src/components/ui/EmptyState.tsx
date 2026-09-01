import { Inbox } from 'lucide-react'

export function EmptyState({
  icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ size?: number | string; className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
}) {
  const Icon = icon
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground max-w-md">{description}</p>}
      </div>
      {action}
    </div>
  )
}