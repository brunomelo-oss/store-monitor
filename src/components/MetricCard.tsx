import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; direction: 'up' | 'down'; label: string }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const variantBorder: Record<string, string> = {
  default: 'border-slate-200/80 dark:border-white/10',
  success: 'border-emerald-500/60 dark:border-emerald-500/40',
  warning: 'border-amber-500/60 dark:border-amber-500/40',
  danger: 'border-red-500/60 dark:border-red-500/40',
  info: 'border-blue-500/60 dark:border-blue-500/40',
}

const variantText = {
  default: 'text-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
}

const variantHoverBorder: Record<string, string> = {
  default: 'hover:border-slate-300 dark:hover:border-white/20',
  success: 'hover:border-emerald-500 dark:hover:border-emerald-400/60',
  warning: 'hover:border-amber-500 dark:hover:border-amber-400/60',
  danger: 'hover:border-red-500 dark:hover:border-red-400/60',
  info: 'hover:border-blue-500 dark:hover:border-blue-400/60',
}

export function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl transition-all duration-200 shadow-sm dark:shadow-none ${variantBorder[variant]} ${variantHoverBorder[variant]} hover:bg-slate-100/80 dark:hover:bg-white/[0.07] hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${variantText[variant]}`}>{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground/80 mt-1">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          <span className={trend.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground/60">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
