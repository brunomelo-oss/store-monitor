interface ProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  showLabel?: boolean
  className?: string
}

const barColors = {
  default: 'bg-muted-foreground',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
}

const trackColors = {
  default: 'bg-muted',
  success: 'bg-emerald-500/10',
  warning: 'bg-amber-500/10',
  danger: 'bg-red-500/10',
  info: 'bg-blue-500/10',
}

const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

export function Progress({ value, max = 100, size = 'md', variant = 'default', showLabel = false, className = '' }: ProgressProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 rounded-full ${trackColors[variant]} ${heights[size]} overflow-hidden`}>
        <div
          className={`${heights[size]} rounded-full ${barColors[variant]} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-muted-foreground shrink-0">{pct}%</span>}
    </div>
  )
}
