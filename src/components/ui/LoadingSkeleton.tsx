import { Loader2 } from 'lucide-react'

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`shimmer-bg rounded-lg ${className}`} />
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <LoadingSkeleton className="h-8 w-48" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

export function Spinner({ size = 24 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-muted-foreground" />
}