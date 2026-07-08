import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; direction: 'up' | 'down'; label: string }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const variantStyles: Record<string, string> = {
  default: 'border-border',
  success: 'border-green-500/30 bg-green-500/5',
  warning: 'border-yellow-500/30 bg-yellow-500/5',
  danger: 'border-red-500/30 bg-red-500/5',
}

const variantText = {
  default: 'text-foreground',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  danger: 'text-red-400',
}

export function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]} transition-colors`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${variantText[variant]}`}>{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          <span className={trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}>
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
