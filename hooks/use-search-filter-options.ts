import { useCallback, useEffect, useState } from 'react';

import type { AggOption } from '@/types/aggregation';
import { useDebounce } from '@/lib/debounce';
import { useApi } from './use-api';

interface UseSearchFilterOptionsOptions {
  index: string;
  field: string;
  debounceMs?: number;
}

export function useSearchFilterOptions(options: UseSearchFilterOptionsOptions) {
  const { index, field, debounceMs = 300 } = options;
  const [query, setQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<AggOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { request, cancel } = useApi();

  const fetchOptions = useCallback(
    async (searchQuery: string) => {
      if (!field) return;

      setIsLoading(true);
      setError(null);

      let url = `/api/search/options?index=${encodeURIComponent(index)}&field=${encodeURIComponent(field)}`;
      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }

      try {
        await request(url, {
          onSuccess: (data) => {
            setFilterOptions(Array.isArray(data) ? data : []);
          },
          onError: (err) => {
            setError(err);
            setFilterOptions([]);
          },
          onFinally: () => {
            setIsLoading(false);
          },
        });
      } catch (err) {
        // Error already handled in useApi
      }
    },
    [request, index, field]
  );

  const debouncedFetch = useDebounce(fetchOptions, debounceMs);

  const updateQuery = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      debouncedFetch(newQuery);
    },
    [debouncedFetch]
  );

  const clearOptions = useCallback(() => {
    setFilterOptions([]);
    setError(null);
    cancel();
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    query,
    filterOptions,
    isLoading,
    error,
    updateQuery,
    clearOptions,
  };
}
