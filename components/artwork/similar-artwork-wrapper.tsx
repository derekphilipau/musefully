import { Suspense } from 'react';

import type { ArtworkDocument } from '@/types/document';
import { SimilarArtworksSkeleton } from '@/components/skeletons/similar-artworks-skeleton';
import { SimilarArtworkList } from './similar-artwork-list';

interface SimilarArtworkWrapperProps {
  title: string;
  similar: ArtworkDocument[];
  isMultiSource: boolean;
}

export function SimilarArtworkWrapper({
  title,
  similar,
  isMultiSource,
}: SimilarArtworkWrapperProps) {
  return (
    <Suspense fallback={<SimilarArtworksSkeleton />}>
      <SimilarArtworkList
        title={title}
        similar={similar}
        isMultiSource={isMultiSource}
      />
    </Suspense>
  );
}
