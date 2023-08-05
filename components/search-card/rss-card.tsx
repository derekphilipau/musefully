import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';
import { truncate } from '@/util/various';

import type { BaseDocument } from '@/types/baseDocument';
import { SourceHeader } from '../source/source-header';

function getContainerClass(layout) {
  if (layout === 'grid') return '';
  return 'grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-x-6 gap-y-3';
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
        {isMultiDataset && layout === 'grid' && (
          <SourceHeader item={item} showDate={true} isSmall={true} />
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
        <Link href={item.url}>
          {isMultiDataset && layout !== 'grid' && (
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
