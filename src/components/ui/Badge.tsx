export function Badge({
  variant = 'default',
  size = 'md',
  children,
  dot = false,
  className = '',
}: {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  children: React.ReactNode
  dot?: boolean
  className?: string
}) {
  const variants: Record<string, string> = {
    default: 'bg-border/40 text-foreground border-border',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    neutral: 'bg-surface text-muted-foreground border-border',
  }
  const dots: Record<string, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    default: 'bg-muted-foreground',
    neutral: 'bg-muted-foreground',
  }
  const sizeCls = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-md border ${variants[variant]} ${sizeCls} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />}
      {children}
    </span>
  )
}