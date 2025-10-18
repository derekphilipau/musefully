'use client';

import { ReactNode, Suspense } from 'react';
import { ThemeProvider } from 'next-themes';

import { LoadingProvider } from '@/components/loading/loading-provider';
import { NavigationProgress } from '@/components/loading/navigation-progress';
import { PreferencesProvider } from '@/contexts/preferences-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <PreferencesProvider>
        <LoadingProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </LoadingProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
