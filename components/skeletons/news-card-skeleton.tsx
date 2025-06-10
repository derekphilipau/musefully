import { Skeleton } from '@/components/ui/skeleton';

interface NewsCardSkeletonProps {
  showSource?: boolean;
  hasImage?: boolean;
}

export function NewsCardSkeleton({
  showSource = false,
  hasImage = true,
}: NewsCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Source header skeleton */}
      {showSource && <Skeleton className="h-3 w-20" />}

      {/* Image skeleton */}
      {hasImage && <Skeleton className="h-48 w-full" />}

      {/* Title skeleton */}
      <Skeleton className="size-5/6" />

      {/* Description skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}
