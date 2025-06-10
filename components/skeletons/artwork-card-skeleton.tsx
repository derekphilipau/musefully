import { Skeleton } from '@/components/ui/skeleton';

interface ArtworkCardSkeletonProps {
  showSource?: boolean;
  showColor?: boolean;
}

export function ArtworkCardSkeleton({
  showSource = false,
  showColor = false,
}: ArtworkCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Source header skeleton */}
      {showSource && <Skeleton className="h-3 w-16" />}

      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" />

      {/* Color palette skeleton */}
      {showColor && (
        <div className="mt-2 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-8" />
          ))}
        </div>
      )}

      {/* Title skeleton */}
      <Skeleton className="h-5 w-4/5" />

      {/* Artist skeleton */}
      <Skeleton className="h-4 w-2/3" />

      {/* Date skeleton */}
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}
