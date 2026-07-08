export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Bento metrics skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-zinc-800/50 rounded-xl" />
        ))}
      </div>

      {/* Install chart skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-48 bg-zinc-800/50 rounded" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-8 bg-zinc-800/30 rounded-lg" />
        ))}
      </div>

      {/* Ratings skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-40 bg-zinc-800/50 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-zinc-800/30 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Indicators skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-zinc-800/30 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
