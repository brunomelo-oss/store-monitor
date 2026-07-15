import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; direction: 'up' | 'down'; label: string }
  variant?: 'success' | 'warning' | 'attention' | 'rejected' | 'pending' | 'rate' | 'default'
}

const variantText: Record<string, string> = {
  success:  'text-emerald-500',
  warning:  'text-amber-500',
  attention:'text-cyan-500',
  rejected: 'text-gray-500',
  pending:  'text-sky-500',
  rate:     'text-violet-500',
  default:  'text-emerald-500',
}

export function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <div className="rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border border-border bg-card backdrop-blur-xl">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon && <span className="text-muted-foreground opacity-60">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${variantText[variant] || variantText.default}`}>{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground/80 mt-1">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          <span className={`font-medium ${trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground/60">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
