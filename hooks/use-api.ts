import { useCallback, useRef } from 'react';

interface ApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

export function useApi() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const request = useCallback(async (url: string, options: ApiOptions = {}) => {
    const { onSuccess, onError, onFinally } = options;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onSuccess?.(data);
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't call onError
        return;
      }
      onError?.(error as Error);
      throw error;
    } finally {
      abortControllerRef.current = null;
      onFinally?.();
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return { request, cancel };
}
