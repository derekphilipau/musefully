'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      setProgress(0);

      // Simulate progressive loading
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Stop at 90% until completion
          }
          return prev + Math.random() * 30;
        });
      }, 100);

      return interval;
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    };

    // Start progress on route change
    const interval = handleStart();

    // Complete progress after a short delay
    const timer = setTimeout(handleComplete, 300);

    return () => {
      if (interval) clearInterval(interval);
      clearTimeout(timer);
      setLoading(false);
      setProgress(0);
    };
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50">
      <div className="h-1 bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200 ease-out"
          style={{
            width: `${Math.min(progress, 100)}%`,
            boxShadow:
              progress > 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
          }}
        />
      </div>
    </div>
  );
}
