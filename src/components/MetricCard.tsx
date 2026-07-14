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
  success:  'text-[#10b981]',
  warning:  'text-[#f59e0b]',
  attention:'text-[#06b6d4]',
  rejected: 'text-[#4b5563]',
  pending:  'text-[#0ea5e9]',
  rate:     'text-[#8b5cf6]',
  default:  'text-[#10b981]',
}

export function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <div className="rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.03)] backdrop-blur-xl">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-[#888888]">{title}</span>
        {icon && <span className="text-[#888888] opacity-60">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${variantText[variant] || variantText.default}`}>{value}</div>
      {subtitle && <p className="text-xs text-[#888888]/80 mt-1">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          <span className={`font-medium ${trend.direction === 'up' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-[#888888]/60">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
