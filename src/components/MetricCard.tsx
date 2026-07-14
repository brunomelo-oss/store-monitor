import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; direction: 'up' | 'down'; label: string }
  variant?: 'success' | 'warning' | 'attention' | 'rejected' | 'pending' | 'rate' | 'default'
}

const variantStyle: Record<string, { border: string; text: string }> = {
  success:  { border: 'border-[#10b981]',   text: 'text-[#10b981]' },
  warning:  { border: 'border-[#f59e0b]',   text: 'text-[#f59e0b]' },
  attention:{ border: 'border-[#06b6d4]',   text: 'text-[#06b6d4]' },
  rejected: { border: 'border-[#4b5563]',   text: 'text-[#4b5563]' },
  pending:  { border: 'border-[#0ea5e9]',   text: 'text-[#0ea5e9]' },
  rate:     { border: 'border-[#8b5cf6]',   text: 'text-[#8b5cf6]' },
  default:  { border: 'border-[#10b981]',   text: 'text-[#10b981]' },
}

export function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  const s = variantStyle[variant] || variantStyle.default
  return (
    <div
      className={`rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${s.border} border-2 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl hover:brightness-110`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-[#888888]">{title}</span>
        {icon && <span className="text-[#888888] opacity-60">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${s.text}`}>{value}</div>
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
