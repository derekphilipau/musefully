'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface LoadingContextType {
  isActionLoading: boolean;
  setActionLoading: (loading: boolean) => void;
  loadingMessage?: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const setActionLoading = (loading: boolean) => {
    setIsActionLoading(loading);
    if (!loading) {
      setLoadingMessage('');
    }
  };

  return (
    <LoadingContext.Provider
      value={{
        isActionLoading,
        setActionLoading,
        loadingMessage,
        setLoadingMessage,
      }}
    >
      {children}
      {/* Global loading overlay for actions */}
      {isActionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-900">
            <div className="flex items-center space-x-3">
              <div className="size-5 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600" />
              <span className="text-sm font-medium">
                {loadingMessage || 'Processing...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useActionLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useActionLoading must be used within a LoadingProvider');
  }
  return context;
}
