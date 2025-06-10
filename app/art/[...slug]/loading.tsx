export default function ArtworkLoading() {
  return (
    <>
      <section className="container grid gap-x-12 gap-y-6 pb-8 pt-2 md:grid-cols-2 md:pb-10 md:pt-4 lg:grid-cols-8">
        {/* Image section skeleton */}
        <div className="flex items-start justify-center md:col-span-1 lg:col-span-3">
          <div className="aspect-square w-full max-w-md animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Details section skeleton */}
        <div className="md:col-span-1 lg:col-span-5">
          {/* Source header skeleton */}
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />

          {/* Title skeleton */}
          <div className="mb-2 space-y-2">
            <div className="h-8 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Date skeleton */}
          <div className="mb-4 h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />

          {/* Artist name skeleton */}
          <div className="h-6 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />

          {/* Artist dates skeleton */}
          <div className="mb-4 mt-2 h-3 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />

          {/* Department skeleton */}
          <div className="mb-4 size-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />

          {/* Description skeleton */}
          <div className="mb-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="size-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-x-2">
            <div className="h-10 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-10 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Additional details skeleton */}
          <div className="gap-x-4 pt-4 lg:flex">
            <div className="space-y-3">
              <div className="h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-36 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar artworks skeleton */}
      <div className="bg-neutral-100 dark:bg-black">
        <section className="container pb-8 pt-6 md:py-8">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="grid grid-cols-2 gap-6 pb-8 md:grid-cols-4 md:pb-10 lg:grid-cols-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="aspect-square w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
          <div className="h-8 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </section>
      </div>
    </>
  );
}
