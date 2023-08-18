import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';
import {
  getArtworkUrlWithSlug,
  trimStringToLengthAtWordBoundary,
} from '@/util/various';

import type { ArtworkDocument } from '@/types/artworkDocument';
import { DominantColors } from '@/components/color/dominant-colors';
import { SourceHeader } from '@/components/source/source-header';
import { DocumentImage } from '../image/document-image';

const IMAGE_DOMAIN = process.env.IMAGE_DOMAIN || '';

function getContainerClass(layout) {
  if (layout === 'grid') return '';
  return 'grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-x-6 gap-y-3';
}

function getDetailsClass(layout) {
  if (layout === 'grid') return 'pt-3';
  return 'lg:col-span-2';
}

interface ArtworkCardProps {
  item: ArtworkDocument;
  layout: 'grid' | 'list';
  showType: boolean;
  showColor: boolean;
  isMultiSource: boolean;
}

export function ArtworkCard({
  item,
  layout,
  showType,
  showColor,
  isMultiSource,
}: ArtworkCardProps) {
  if (!item) return null;
  const dict = getDictionary();

  const primaryConstituentName =
    item.primaryConstituent?.name || 'Maker Unknown';

  const href = getArtworkUrlWithSlug(item._id, item.title);

  return (
    <div className={getContainerClass(layout)}>
      <div>
        {isMultiSource && layout === 'grid' && (
          <SourceHeader item={item} showDate={false} isSmall={true} />
        )}
        <div className="flex items-center justify-center bg-neutral-50 text-neutral-200 transition-colors hover:bg-neutral-100 hover:text-neutral-300 dark:bg-neutral-800 dark:text-neutral-900 dark:hover:bg-neutral-700  dark:hover:text-neutral-800">
          <Link href={href}>
            <DocumentImage
              item={item}
              imageDomain={IMAGE_DOMAIN}
              className="h-48 object-contain"
            />
          </Link>
        </div>
      </div>
      {showColor && (
        <div className="mt-2">
          <DominantColors item={item} height={4} isLinked={false} />
        </div>
      )}
      <div className={getDetailsClass(layout)}>
        {isMultiSource && layout !== 'grid' && (
          <SourceHeader item={item} showDate={false} />
        )}
        <Link href={href}>
          {showType && layout === 'list' && (
            <h4 className="mb-2 text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
              {dict['index.art.itemTitle']}
            </h4>
          )}
          <h4 className="mb-2 text-xl font-semibold">
            {item.title}
            {item.formattedDate ? `, ${item.formattedDate}` : ''}
          </h4>
          <h5 className="text-lg">{primaryConstituentName}</h5>
          {item.primaryConstituent?.dates && (
            <span className="text-sm text-neutral-700 dark:text-neutral-400">
              {item.primaryConstituent?.dates}
            </span>
          )}
          {layout === 'list' && (
            <p>{trimStringToLengthAtWordBoundary(item.description, 200)}</p>
          )}
        </Link>
      </div>
    </div>
  );
}
