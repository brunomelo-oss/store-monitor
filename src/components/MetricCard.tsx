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
  default: 'border-white/10',
  success: 'border-emerald-500/40',
  warning: 'border-amber-500/40',
  danger: 'border-red-500/40',
  info: 'border-blue-500/40',
}

const variantText = {
  default: 'text-white',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  danger: 'text-red-400',
  info: 'text-blue-400',
}

const variantHoverBorder: Record<string, string> = {
  default: 'hover:border-white/20',
  success: 'hover:border-emerald-400/60',
  warning: 'hover:border-amber-400/60',
  danger: 'hover:border-red-400/60',
  info: 'hover:border-blue-400/60',
}

export function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 bg-white/[0.04] backdrop-blur-xl transition-all duration-200 ${variantBorder[variant]} ${variantHoverBorder[variant]} hover:bg-white/[0.07] hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-white/60">{title}</span>
        {icon && <span className="text-white/60">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${variantText[variant]}`}>{value}</div>
      {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          <span className={trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}>
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-white/50">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
