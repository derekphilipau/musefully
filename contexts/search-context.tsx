'use client';

import { createContext, ReactNode, useContext } from 'react';

import type { AggOptions } from '@/types/aggregation';
import type { SearchParams } from '@/lib/elasticsearch/search/searchParams';

interface SearchContextValue {
  searchParams: SearchParams;
  options: AggOptions;
  count: number;
  totalPages: number;
  isMultiSource: boolean;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
  searchParams: SearchParams;
  options: AggOptions;
  count: number;
  totalPages: number;
  isMultiSource: boolean;
}

export function SearchProvider({
  children,
  searchParams,
  options,
  count,
  totalPages,
  isMultiSource,
}: SearchProviderProps) {
  const value = {
    searchParams,
    options,
    count,
    totalPages,
    isMultiSource,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
