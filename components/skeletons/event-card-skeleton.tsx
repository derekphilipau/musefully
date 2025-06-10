import { Skeleton } from '@/components/ui/skeleton';

interface EventCardSkeletonProps {
  showSource?: boolean;
}

export function EventCardSkeleton({
  showSource = false,
}: EventCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Source header skeleton */}
      {showSource && <Skeleton className="h-3 w-16" />}

      {/* Image skeleton */}
      <Skeleton className="h-48 w-full" />

      {/* Event type skeleton */}
      <Skeleton className="h-3 w-20" />

      {/* Title skeleton */}
      <Skeleton className="h-5 w-4/5" />

      {/* Date skeleton */}
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
