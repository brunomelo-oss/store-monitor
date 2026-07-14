import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; direction: 'up' | 'down'; label: string }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const variantAccent = {
  default: '#10b981',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
}

const variantText = {
  default: 'text-[#10b981]',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  danger: 'text-red-400',
  info: 'text-blue-400',
}

export function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  const accent = variantAccent[variant]
  return (
    <div className="sasi-card rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-[#888888]">{title}</span>
        {icon && <span className="text-[#888888]">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${variantText[variant]}`}>{value}</div>
      {subtitle && <p className="text-xs text-[#888888]/80 mt-1">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          <span style={{ color: accent }} className="font-medium">
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-[#888888]/60">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
