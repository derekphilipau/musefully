import { useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';

type DebounceCallbackType = (...args: any[]) => void;

export const useDebounce = (
  callback: DebounceCallbackType,
  ms: number = 600
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallbackRef = useRef(
    debounce((...args: any[]) => {
      callbackRef.current(...args);
    }, ms)
  );

  return debouncedCallbackRef.current;
};
