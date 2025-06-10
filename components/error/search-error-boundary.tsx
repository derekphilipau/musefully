'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface SearchErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class SearchErrorBoundary extends Component<
  SearchErrorBoundaryProps,
  SearchErrorBoundaryState
> {
  constructor(props: SearchErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SearchErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Search component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="mb-4 size-8 text-red-600 dark:text-red-400" />
          <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
            Search Error
          </h3>
          <p className="mb-4 text-sm text-red-700 dark:text-red-300">
            Unable to load search results. Please try again.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false })}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
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