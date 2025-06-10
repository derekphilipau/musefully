import { useCallback, useEffect, useState } from 'react';

import type { TermDocument } from '@/types/document';
import { useDebounce } from '@/lib/debounce';
import { useApi } from './use-api';

interface UseSearchSuggestionsOptions {
  minLength?: number;
  debounceMs?: number;
}

export function useSearchSuggestions(
  options: UseSearchSuggestionsOptions = {}
) {
  const { minLength = 3, debounceMs = 300 } = options;
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TermDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { request, cancel } = useApi();

  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minLength) {
        setSuggestions([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await request(
          `/api/search/suggest?q=${encodeURIComponent(searchQuery)}`,
          {
            onSuccess: (data) => {
              setSuggestions(data?.data || []);
            },
            onError: (err) => {
              setError(err);
              setSuggestions([]);
            },
            onFinally: () => {
              setIsLoading(false);
            },
          }
        );
      } catch (err) {
        // Error already handled in useApi
      }
    },
    [request, minLength]
  );

  const debouncedFetch = useDebounce(fetchSuggestions, debounceMs);

  const updateQuery = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      debouncedFetch(newQuery);
    },
    [debouncedFetch]
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
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
    suggestions,
    isLoading,
    error,
    updateQuery,
    clearSuggestions,
  };
}
