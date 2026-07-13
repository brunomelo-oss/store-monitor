import type { LucideIcon } from 'lucide-react'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void; variant?: 'primary' | 'outline' }
}

export function EmptyState({ icon: Icon = PackageOpen, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
        <Icon size={24} className="text-muted-foreground/60" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className={`px-5 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 ${
            action.variant === 'outline'
              ? 'border border-slate-200 dark:border-white/10 text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06]'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
