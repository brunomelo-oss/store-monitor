import { memo } from 'react'

export const MetricCard = memo(function MetricCard({
  label,
  value,
  subtitle,
  icon,
  variant = 'default',
  trend,
}: {
  label: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning'
  trend?: { direction: 'up' | 'down'; value: string }
}) {
  const valueColor = variant === 'success'
    ? 'text-emerald-500'
    : variant === 'danger'
      ? 'text-red-500'
      : variant === 'warning'
        ? 'text-yellow-500'
        : 'text-foreground'

  return (
    <div className="sasi-card rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend.direction === 'up' ? '▲' : '▼'} {trend.value}
          </span>
        )}
      </div>
      {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
    </div>
  )
})