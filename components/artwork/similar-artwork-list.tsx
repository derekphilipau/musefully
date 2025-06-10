'use client';

import { memo, useMemo, useState } from 'react';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { ArtworkDocument } from '@/types/document';
import { SimilarArtworkCard } from '@/components/artwork/similar-artwork-card';
import { Button } from '@/components/ui/button';

const SIMILAR_MAX_ITEMS = 24;
const SIMILAR_MIN_ITEMS = 12;

interface SimilarArtworkListProps {
  title: string;
  similar: ArtworkDocument[];
  isMultiSource: boolean;
}

function SimilarArtworkListComponent({
  title,
  similar,
  isMultiSource,
}: SimilarArtworkListProps) {
  const dict = getDictionary();
  const [showAllSimilar, setShowAllSimilar] = useState(false);

  const displayedItems = useMemo(() => {
    if (!similar?.length) return [];
    return similar.slice(
      0,
      showAllSimilar ? SIMILAR_MAX_ITEMS : SIMILAR_MIN_ITEMS
    );
  }, [similar, showAllSimilar]);

  const shouldShowMoreButton = useMemo(() => {
    return !showAllSimilar && similar && similar.length > SIMILAR_MIN_ITEMS;
  }, [showAllSimilar, similar]);

  if (!similar || similar.length === 0) return null;

  return (
    <div className="bg-neutral-100 dark:bg-black">
      <section className="container pb-8 pt-6 md:py-8">
        <h3 className="mb-6 text-xl font-bold leading-tight tracking-tighter md:text-2xl lg:text-3xl">
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-6 pb-8 md:grid-cols-4 md:pb-10 lg:grid-cols-6">
          {displayedItems.map(
            (item) =>
              item && (
                <SimilarArtworkCard
                  key={item._id}
                  item={item}
                  isMultiSource={isMultiSource}
                />
              )
          )}
        </div>
        {shouldShowMoreButton && (
          <Button
            onClick={() => setShowAllSimilar(true)}
            variant="default"
            size="sm"
            aria-label={dict['artwork.showMore']}
          >
            {dict['artwork.showMore']}
          </Button>
        )}
      </section>
    </div>
  );
}

export const SimilarArtworkList = memo(SimilarArtworkListComponent);
