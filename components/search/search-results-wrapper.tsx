'use client';

import { Suspense } from 'react';

import { SearchResultsSkeleton } from '@/components/skeletons/search-results-skeleton';

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
    <Suspense
      fallback={
        <SearchResultsSkeleton itemType={itemType} showFilters={showFilters} />
      }
    >
      {children}
    </Suspense>
  );
}
