export function DashboardSkeleton() {
  const s = 'rounded-xl bg-muted animate-pulse'

  return (
    <div className="space-y-8 animate-pulse">
      <div className={`h-12 w-64 ${s}`} />
      <div className="flex gap-2">
        <div className={`h-10 w-32 ${s}`} />
        <div className={`h-10 w-32 ${s}`} />
        <div className={`h-10 w-32 ${s}`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className={`h-28 ${s}`} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`h-80 lg:col-span-2 ${s}`} />
        <div className={`h-80 ${s}`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`h-64 ${s}`} />
        <div className={`h-64 ${s}`} />
      </div>
      <div className={`h-48 ${s}`} />
    </div>
  )
}
