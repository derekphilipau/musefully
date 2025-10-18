'use client';

import { ReactNode, useMemo } from 'react';

import { useSearch } from '@/contexts/search-context';
import { useFilterVisibility } from '@/hooks/use-filter-visibility';

interface SearchLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function SearchLayout({ sidebar, children }: SearchLayoutProps) {
  const { searchParams } = useSearch();
  const { isVisible, isHydrated } = useFilterVisibility(
    searchParams.isShowFilters
  );

  const shouldShowSidebar = useMemo(() => {
    if (!isHydrated) return searchParams.isShowFilters;
    return isVisible;
  }, [isHydrated, isVisible, searchParams.isShowFilters]);

  const mainColumnClass = shouldShowSidebar
    ? 'sm:col-span-2 md:col-span-3'
    : 'sm:col-span-3 md:col-span-4';

  return (
    <div className="gap-6 pb-8 pt-2 sm:grid sm:grid-cols-3 md:grid-cols-4 md:pt-4">
      {shouldShowSidebar && (
        <aside
          className="hidden h-full space-y-2 sm:col-span-1 sm:block"
          aria-label="Search filters"
        >
          {sidebar}
        </aside>
      )}
      <main className={mainColumnClass} role="main" aria-label="Search results">
        {children}
      </main>
    </div>
  );
}
