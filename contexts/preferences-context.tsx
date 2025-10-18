'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type PreferencePrimitive = string | number | boolean | null;
type PreferenceValue =
  | PreferencePrimitive
  | PreferencePrimitive[]
  | Record<string, unknown>;

type PreferencesState = Record<string, PreferenceValue | undefined>;

interface PreferencesContextValue {
  preferences: PreferencesState;
  setPreference: (key: string, value: PreferenceValue | undefined) => void;
  removePreference: (key: string) => void;
  isHydrated: boolean;
}

const STORAGE_KEY = 'musefully.preferences.v1';

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined
);

interface PreferencesProviderProps {
  children: ReactNode;
  initialState?: PreferencesState;
}

function readPreferencesFromStorage(): PreferencesState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as PreferencesState;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Unable to read preferences from localStorage', err);
  }
  return {};
}

function writePreferencesToStorage(state: PreferencesState) {
  if (typeof window === 'undefined') return;
  try {
    const entries = Object.entries(state).filter(
      (entry): entry is [string, PreferenceValue] =>
        entry[1] !== undefined && entry[1] !== null
    );
    const serialized = JSON.stringify(Object.fromEntries(entries));
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Unable to persist preferences to localStorage', err);
  }
}

export function PreferencesProvider({
  children,
  initialState = {},
}: PreferencesProviderProps) {
  const [preferences, setPreferences] =
    useState<PreferencesState>(initialState);
  const isMountedRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (isMountedRef.current) return;
    const stored = readPreferencesFromStorage();
    if (Object.keys(stored).length > 0) {
      setPreferences((prev) => ({ ...prev, ...stored }));
    }
    isMountedRef.current = true;
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;
    writePreferencesToStorage(preferences);
  }, [preferences]);

  const setPreference = useCallback(
    (key: string, value: PreferenceValue | undefined) => {
      setPreferences((prev) => {
        if (value === undefined || value === null) {
          if (!(key in prev)) return prev;
          const next = { ...prev };
          delete next[key];
          return next;
        }
        if (prev[key] === value) return prev;
        return {
          ...prev,
          [key]: value,
        };
      });
    },
    []
  );

  const removePreference = useCallback((key: string) => {
    setPreferences((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      setPreference,
      removePreference,
      isHydrated,
    }),
    [preferences, setPreference, removePreference, isHydrated]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

export function usePreference<T extends PreferenceValue>(
  key: string,
  defaultValue: T
): [T, (value: T | undefined) => void, boolean] {
  const { preferences, setPreference, isHydrated } = usePreferences();
  const value = (preferences[key] as T | undefined) ?? defaultValue;
  const setValue = useCallback(
    (nextValue: T | undefined) => {
      setPreference(key, nextValue);
    },
    [key, setPreference]
  );
  return [value, setValue, isHydrated];
}
