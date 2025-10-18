import { memo } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { ArtworkDocument } from '@/types/document';
import type { LayoutType } from '@/lib/elasticsearch/search/searchParams';
import {
  LAYOUT_GRID,
  LAYOUT_LIST,
} from '@/lib/elasticsearch/search/searchParams';
import {
  getArtworkUrlWithSlug,
  trimStringToLengthAtWordBoundary,
} from '@/lib/various';
import { DominantColors } from '@/components/color/dominant-colors';
import { ArtworkErrorBoundary } from '@/components/error/artwork-error-boundary';
import { SourceHeader } from '@/components/source/source-header';
import Image from 'next/image';

function getContainerClass(layout: LayoutType) {
  if (layout === LAYOUT_GRID) return '';
  return 'grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-x-6 gap-y-3';
}

function getDetailsClass(layout: LayoutType) {
  if (layout === LAYOUT_GRID) return 'pt-3';
  return 'lg:col-span-2';
}

interface ArtworkCardProps {
  item: ArtworkDocument;
  showType: boolean;
  showColor: boolean;
  layout: LayoutType;
  isMultiSource: boolean;
}

function ArtworkCardComponent({
  item,
  showType,
  showColor,
  layout,
  isMultiSource,
}: ArtworkCardProps) {
  if (!item) return null;
  const dict = getDictionary();
  const displayTitle = item.title?.trim() || 'Untitled';

  const primaryConstituentName =
    item.primaryConstituent?.name || 'Maker Unknown';

  const href = getArtworkUrlWithSlug(item._id, displayTitle);

  return (
    <ArtworkErrorBoundary>
      <div className={getContainerClass(layout)}>
        <div>
          {isMultiSource && layout === LAYOUT_GRID && (
            <SourceHeader item={item} showDate={false} isSmall={true} />
          )}
          <div className="flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
            <Link
              href={href}
              aria-label={`View artwork: ${item.title} by ${primaryConstituentName}`}
              className="flex h-48 w-full items-center justify-center"
            >
              {item.image?.thumbnailUrl ? (
                <Image
                  src={item.image.thumbnailUrl}
                  alt={`${dict['index.art.altText']} ${displayTitle}`}
                  className="max-h-full max-w-full object-contain"
                  width={300}
                  height={300}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-neutral-300 dark:text-neutral-700">
                  {dict['search.imageUnavailable']}
                </div>
              )}
            </Link>
          </div>
          {showColor && (
            <div className="mt-2">
              <DominantColors item={item} height={4} isLinked={false} />
            </div>
          )}
        </div>
        <div className={getDetailsClass(layout)}>
          {isMultiSource && layout !== LAYOUT_GRID && (
            <SourceHeader item={item} showDate={false} />
          )}
          <Link
            href={href}
            aria-label={`View details for ${displayTitle} by ${primaryConstituentName}`}
          >
            {showType && layout === LAYOUT_LIST && (
              <h4 className="mb-2 text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
                {dict['index.art.itemTitle']}
              </h4>
            )}
            <h4 className="mb-2 text-xl font-semibold">
              {displayTitle}
              {item.formattedDate ? `, ${item.formattedDate}` : ''}
            </h4>
            <h5 className="text-lg">{primaryConstituentName}</h5>
            {item.primaryConstituent?.dates && (
              <span className="text-sm text-neutral-700 dark:text-neutral-400">
                {item.primaryConstituent?.dates}
              </span>
            )}
            {layout === LAYOUT_LIST && (
              <p>{trimStringToLengthAtWordBoundary(item.description, 200)}</p>
            )}
          </Link>
        </div>
      </div>
    </ArtworkErrorBoundary>
  );
}

export const ArtworkCard = memo(ArtworkCardComponent);
