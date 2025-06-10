'use client';

import { Component, ReactNode } from 'react';
import { FileQuestion, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArtworkErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ArtworkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ArtworkErrorBoundary extends Component<
  ArtworkErrorBoundaryProps,
  ArtworkErrorBoundaryState
> {
  constructor(props: ArtworkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ArtworkErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Artwork component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <FileQuestion className="mb-4 size-8 text-neutral-400 dark:text-neutral-600" />
          <h3 className="mb-2 text-lg font-semibold text-neutral-700 dark:text-neutral-300">
            Artwork Unavailable
          </h3>
          <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
            Unable to display this artwork. There may be a temporary issue.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false })}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="mr-2 size-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}