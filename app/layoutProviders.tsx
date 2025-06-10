'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

import { LoadingProvider } from '@/components/loading/loading-provider';
import { NavigationProgress } from '@/components/loading/navigation-progress';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LoadingProvider>
        <NavigationProgress />
        {children}
      </LoadingProvider>
    </ThemeProvider>
  );
}
