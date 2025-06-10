'use client';

import { Suspense } from 'react';

import { SearchResultsSkeleton } from '@/components/skeletons/search-results-skeleton';
import { SearchErrorBoundary } from '@/components/error/search-error-boundary';

interface SearchResultsWrapperProps {
  children: React.ReactNode;
  itemType?: 'mixed' | 'art' | 'news' | 'events';
  showFilters?: boolean;
}

export function SearchResultsWrapper({
  children,
  itemType = 'mixed',
  showFilters = true,
}: SearchResultsWrapperProps) {
  return (
    <SearchErrorBoundary>
      <Suspense
        fallback={
          <SearchResultsSkeleton itemType={itemType} showFilters={showFilters} />
        }
      >
        {children}
      </Suspense>
    </SearchErrorBoundary>
  );
}
