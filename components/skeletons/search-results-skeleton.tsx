import { Skeleton } from '@/components/ui/skeleton';
import { ArtworkCardSkeleton } from './artwork-card-skeleton';
import { EventCardSkeleton } from './event-card-skeleton';
import { NewsCardSkeleton } from './news-card-skeleton';

interface SearchResultsSkeletonProps {
  layout?: 'grid' | 'list';
  count?: number;
  showFilters?: boolean;
  itemType?: 'mixed' | 'art' | 'news' | 'events';
}

export function SearchResultsSkeleton({
  layout = 'grid',
  count = 12,
  showFilters = true,
  itemType = 'mixed',
}: SearchResultsSkeletonProps) {
  const gridClass =
    layout === 'grid'
      ? 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'
      : 'grid grid-cols-1 gap-8';

  const renderSkeletonCard = (index: number) => {
    if (itemType === 'art') {
      return <ArtworkCardSkeleton key={index} showSource={true} />;
    } else if (itemType === 'news') {
      return <NewsCardSkeleton key={index} showSource={true} />;
    } else if (itemType === 'events') {
      return <EventCardSkeleton key={index} showSource={true} />;
    } else {
      // Mixed content - alternate between types
      const types = ['art', 'news', 'events'];
      const type = types[index % 3];

      switch (type) {
        case 'art':
          return <ArtworkCardSkeleton key={index} showSource={true} />;
        case 'news':
          return <NewsCardSkeleton key={index} showSource={true} />;
        case 'events':
          return <EventCardSkeleton key={index} showSource={true} />;
        default:
          return <ArtworkCardSkeleton key={index} showSource={true} />;
      }
    }
  };

  return (
    <section className="container pt-2">
      {/* Search header skeleton */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="grow">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Filter tags skeleton */}
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>

      <div className="gap-6 pb-8 pt-2 sm:grid sm:grid-cols-3 md:grid-cols-4 md:pt-4">
        {/* Filters sidebar skeleton */}
        {showFilters && (
          <div className="hidden sm:col-span-1 sm:block h-full space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search results skeleton */}
        <div
          className={
            showFilters
              ? 'sm:col-span-2 md:col-span-3'
              : 'sm:col-span-3 md:col-span-4'
          }
        >
          {/* Pagination controls skeleton */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-4 w-40" />
          </div>

          {/* Results grid skeleton */}
          <div className={gridClass}>
            {[...Array(count)].map((_, i) => renderSkeletonCard(i))}
          </div>

          {/* Bottom pagination skeleton */}
          <div className="mt-8 flex items-center justify-end gap-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </section>
  );
}
