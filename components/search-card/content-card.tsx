import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { BaseDocument } from '@/types/document';
import { sources } from '@/config/sources';
import {
  LAYOUT_GRID,
  LAYOUT_LIST,
} from '@/lib/elasticsearch/search/searchParams';
import type { LayoutType } from '@/lib/elasticsearch/search/searchParams';
import { Icons } from '@/components/icons';

function getContainerClass(layout: LayoutType) {
  if (layout === LAYOUT_GRID) return '';
  return 'grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-x-6 gap-y-3';
}

function getDetailsClass(layout: LayoutType) {
  if (layout === LAYOUT_GRID) return 'pt-3';
  return 'lg:col-span-2';
}

interface ContentCardProps {
  item: BaseDocument;
  showType: boolean;
  layout: LayoutType;
  isMultiSource: boolean;
}

function ContentCardComponent({
  item,
  showType,
  layout,
  isMultiSource,
}: ContentCardProps) {
  if (!item || !item.url) return null;
  const dict = getDictionary();

  return (
    <Link href={item.url}>
      <div className={getContainerClass(layout)}>
        <div>
          {showType && layout === LAYOUT_GRID && (
            <h4 className="mb-2 text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
              {dict['index.content.itemTitle']}
            </h4>
          )}
          <div className="flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700">
            <figure>
              {item.image?.thumbnailUrl ? (
                <Image
                  src={item.image?.thumbnailUrl}
                  className="h-48 object-contain"
                  alt=""
                  width={400}
                  height={400}
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center">
                  <Icons.imageOff className="size-24 text-neutral-300 group-hover:text-neutral-400" />
                  <span className="sr-only">Image Unavailable</span>
                </div>
              )}
              <figcaption></figcaption>
            </figure>
          </div>
        </div>
        <div className={getDetailsClass(layout)}>
          {isMultiSource && (
            <div className="text-sm text-neutral-700 dark:text-neutral-400">
              {sources[item.sourceId || '']?.name}
            </div>
          )}
          {showType && layout === LAYOUT_LIST && (
            <h4 className="mb-2 text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
              {dict['index.news.itemTitle']}
            </h4>
          )}
          <h4 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-white">
            {item.title}
          </h4>
          {item.formattedDate && (
            <p className="text-xs font-normal text-neutral-700 dark:text-neutral-400">
              {item.formattedDate}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export const ContentCard = memo(ContentCardComponent);
