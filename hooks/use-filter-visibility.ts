'use client';

import { useCallback, useMemo } from 'react';

import { usePreference } from '@/contexts/preferences-context';
import type { SearchParams } from '@/lib/elasticsearch/search/searchParams';

const PREFERENCE_KEY = 'search.filters.visible';

export function useFilterVisibility(defaultValue: SearchParams['isShowFilters']) {
  const [storedValue, setStoredValue, isHydrated] = usePreference<boolean>(
    PREFERENCE_KEY,
    defaultValue
  );

  const isVisible = useMemo(() => {
    if (typeof storedValue === 'boolean') return storedValue;
    return defaultValue;
  }, [storedValue, defaultValue]);

  const toggleVisibility = useCallback(
    (next?: boolean) => {
      if (typeof next === 'boolean') {
        setStoredValue(next);
      } else {
        setStoredValue(!isVisible);
      }
    },
    [setStoredValue, isVisible]
  );

  return {
    isVisible,
    toggleVisibility,
    isHydrated,
  };
}
