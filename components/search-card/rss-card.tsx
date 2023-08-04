import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';
import { timeAgo } from '@/util/various';

import type { BaseDocument } from '@/types/baseDocument';
import { Icons } from '@/components/icons';

function getContainerClass(layout) {
  if (layout === 'grid') return 'py-4';
  return 'py-4 grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-x-6 gap-y-3';
}

function getDetailsClass(layout) {
  if (layout === 'grid') return 'pt-3';
  return 'lg:col-span-2';
}

interface RssCardProps {
  item: BaseDocument;
  layout: 'grid' | 'list';
  showType: boolean;
  isMultiDataset: boolean;
}

export function RssCard({
  item,
  layout,
  showType,
  isMultiDataset,
}: RssCardProps) {
  if (!item || !item.url) return null;
  const dict = getDictionary();

  return (
    <div className={getContainerClass(layout)}>
      <div>
        {showType && layout === 'grid' && (
          <h4 className="mb-2 text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
            {item.type === 'rss'
              ? dict['index.content.type.rss']
              : dict['index.content.type.page']}
          </h4>
        )}
        <div className="flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700">
          <Link href={item.url}>
            <figure>
              {item.image?.thumbnailUrl && (
                <Image
                  src={item.image?.thumbnailUrl}
                  className="h-48 object-contain"
                  alt=""
                  width={400}
                  height={400}
                />
              )}
              <figcaption></figcaption>
            </figure>
          </Link>
        </div>
      </div>
      <div className={getDetailsClass(layout)}>
        <div className="mb-2 flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-400">
          <Link href={`/?f=true&source=${item.source}`} className="inline-flex items-center">
            <div className="relative mr-2 flex h-7 w-7 shrink-0 overflow-hidden rounded-full">
              <Image
                src={`/img/logos/${item.sourceId}.jpg`}
                className="aspect-square h-full w-full"
                alt={item.source ? item.source : 'Logo'}
                width={400}
                height={400}
              />
            </div>
            {item.source}
          </Link>
          <div>{item.date ? timeAgo(item.date) : null}</div>
        </div>
        {showType && layout === 'list' && (
          <h4 className="mb-2 text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
            {dict['index.content.itemTitle']}
          </h4>
        )}
        <Link href={item.url}>
          <h4 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-white">
            {item.title}
          </h4>
          {item.formattedDate && (
            <p className="text-xs font-normal text-neutral-700 dark:text-neutral-400">
              {item.formattedDate}
            </p>
          )}
          {item.description && (
            <p className="text-sm text-neutral-700 dark:text-neutral-400">
              {item.description}
            </p>
          )}
        </Link>
      </div>
    </div>
  );
}
