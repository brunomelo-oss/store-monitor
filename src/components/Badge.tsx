import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  neutral: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
}

const dotClasses: Record<BadgeVariant, string> = {
  default: 'bg-muted-foreground',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-zinc-400',
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
}

export function Badge({ children, variant = 'default', size = 'sm', dot, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]}`} />}
      {children}
    </span>
  )
}
