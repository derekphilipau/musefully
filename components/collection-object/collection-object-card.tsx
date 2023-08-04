import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';
import {
  getObjectUrlWithSlug,
  trimStringToLengthAtWordBoundary,
} from '@/util/various';

import type { CollectionObjectDocument } from '@/types/collectionObjectDocument';
import { DominantColors } from '@/components/color/dominant-colors';
import { CollectionObjectThumbnail } from '../collection-object-image/collection-object-thumbnail';

function getContainerClass(layout) {
  if (layout === 'grid') return 'py-4';
  return 'py-4 grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-x-6 gap-y-3';
}

function getDetailsClass(layout) {
  if (layout === 'grid') return 'pt-3';
  return 'lg:col-span-2';
}

interface CollectionObjectCardProps {
  item: CollectionObjectDocument;
  layout: 'grid' | 'list';
  showType: boolean;
  showColor: boolean;
  isMultiDataset: boolean;
}

export function CollectionObjectCard({
  item,
  layout,
  showType,
  showColor,
  isMultiDataset,
}: CollectionObjectCardProps) {
  if (!item) return null;
  const dict = getDictionary();

  const primaryConstituentName =
    item.primaryConstituent?.name || 'Maker Unknown';

  const href = getObjectUrlWithSlug(item._id, item.title);

  return (
    <Link href={href}>
      <div className={getContainerClass(layout)}>
        <div>
          {showType && layout === 'grid' && (
            <h4 className="mb-2 text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
              {dict['index.collections.itemTitle']}
            </h4>
          )}
          <div className="flex items-center justify-center bg-neutral-50 text-neutral-200 hover:bg-neutral-100 hover:text-neutral-300 dark:bg-neutral-800 dark:text-neutral-900 dark:hover:bg-neutral-700  dark:hover:text-neutral-800">
            <CollectionObjectThumbnail item={item} />
          </div>
        </div>
        {showColor && (
          <div className="mt-2">
            <DominantColors item={item} height={4} isLinked={false} />
          </div>
        )}
        <div className={getDetailsClass(layout)}>
          {isMultiDataset && (
            <div className="text-sm text-neutral-700 dark:text-neutral-400">
              {item.source}
            </div>
          )}
          {showType && layout === 'list' && (
            <h4 className="mb-2 text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
              {dict['index.collections.itemTitle']}
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
        </div>
      </div>
    </Link>
  );
}
