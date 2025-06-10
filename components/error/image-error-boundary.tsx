'use client';

import { Component, ReactNode } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageErrorBoundaryState {
  hasError: boolean;
}

interface ImageErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ImageErrorBoundary extends Component<
  ImageErrorBoundaryProps,
  ImageErrorBoundaryState
> {
  constructor(props: ImageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ImageErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Image component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
          <ImageOff className="mb-2 size-8 text-neutral-400 dark:text-neutral-600" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Unable to load image
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}