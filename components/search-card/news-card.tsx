import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearch } from '@/contexts/search-context';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { BaseDocument } from '@/types/document';
import { LAYOUT_GRID } from '@/lib/elasticsearch/search/searchParams';
import type { LayoutType } from '@/lib/elasticsearch/search/searchParams';
import { truncate } from '@/lib/various';
import { SourceHeader } from '../source/source-header';

function getContainerClass(layout) {
  if (layout === LAYOUT_GRID) return '';
  return 'grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-x-6 gap-y-3';
}

function getDetailsClass(layout) {
  if (layout === LAYOUT_GRID) return '';
  return 'lg:col-span-2';
}

interface NewsCardProps {
  item: BaseDocument;
  showType: boolean;
}

function NewsCardComponent({ item, showType }: NewsCardProps) {
  const { searchParams, isMultiSource } = useSearch();
  const layout = searchParams.layout;

  if (!item || !item.url) return null;
  const dict = getDictionary();

  return (
    <div className={getContainerClass(layout)}>
      <div>
        {isMultiSource && layout === LAYOUT_GRID && (
          <SourceHeader item={item} showDate={true} isSmall={true} />
        )}
        {item.image?.thumbnailUrl && (
          <div className="mb-3 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700">
            <Link href={item.url}>
              <figure>
                <Image
                  src={item.image?.thumbnailUrl}
                  className="h-48 object-contain"
                  alt=""
                  width={400}
                  height={400}
                />
                <figcaption></figcaption>
              </figure>
            </Link>
          </div>
        )}
      </div>
      <div className={getDetailsClass(layout)}>
        <Link href={item.url}>
          {isMultiSource && layout !== LAYOUT_GRID && (
            <SourceHeader item={item} />
          )}
          <h4 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-white">
            {item.title}
          </h4>
          {item.description && (
            <p className="text-sm text-neutral-700 dark:text-neutral-400">
              {truncate(item.description, item.image?.thumbnailUrl ? 200 : 400)}
            </p>
          )}
        </Link>
      </div>
    </div>
  );
}

export const NewsCard = memo(NewsCardComponent);
