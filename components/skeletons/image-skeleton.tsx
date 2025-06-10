import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export function ImageSkeleton({
  className,
  aspectRatio = 'square',
}: ImageSkeletonProps) {
  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'h-48',
  }[aspectRatio];

  return <Skeleton className={cn('w-full', aspectClass, className)} />;
}
