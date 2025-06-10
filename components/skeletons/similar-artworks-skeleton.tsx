import { Skeleton } from '@/components/ui/skeleton';

interface SimilarArtworksSkeletonProps {
  count?: number;
}

export function SimilarArtworksSkeleton({
  count = 12,
}: SimilarArtworksSkeletonProps) {
  return (
    <div className="bg-neutral-100 dark:bg-black">
      <section className="container pb-8 pt-6 md:py-8">
        {/* Title skeleton */}
        <Skeleton className="mb-6 h-8 w-48" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 gap-6 pb-8 md:grid-cols-4 md:pb-10 lg:grid-cols-6">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="space-y-3">
              {/* Source header skeleton */}
              <Skeleton className="h-3 w-16" />
              {/* Image skeleton */}
              <Skeleton className="aspect-square w-full" />
              {/* Title skeleton */}
              <Skeleton className="h-4 w-3/4" />
              {/* Artist skeleton */}
              <Skeleton className="h-3 w-1/2" />
              {/* Date skeleton */}
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>

        {/* Show more button skeleton */}
        <Skeleton className="h-8 w-24" />
      </section>
    </div>
  );
}
