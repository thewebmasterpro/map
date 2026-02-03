/**
 * Skeleton loading components for better UX
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      role="status"
      aria-label="Chargement..."
    />
  );
}

export function TaskSkeleton() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-start gap-3">
        {/* Icon skeleton */}
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

        <div className="flex-1 space-y-2">
          {/* Title */}
          <Skeleton className="h-5 w-3/4" />

          {/* Address */}
          <Skeleton className="h-4 w-full" />

          {/* Meta info */}
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {/* Status badge */}
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TaskSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-200">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b border-gray-100">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="w-full h-full bg-gray-100 rounded-lg relative overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-gray-400">Chargement de la carte...</div>
      </div>
    </div>
  );
}
