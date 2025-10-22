import { Skeleton } from '@/components/ui/skeleton';

export function GameSkeleton() {
  return (
    <li className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      {/* Badge skeleton */}
      <div className="w-20 flex-shrink-0">
        <Skeleton className="h-7 w-full rounded-full" />
      </div>
      
      {/* Matchup skeleton */}
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* Time skeleton */}
      <div className="w-15 text-right">
        <Skeleton className="h-4 w-12 ml-auto" />
      </div>
    </li>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: count }).map((_, i) => (
        <GameSkeleton key={i} />
      ))}
    </ul>
  );
}
