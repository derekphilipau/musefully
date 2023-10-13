import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { BaseDocument } from '@/types/baseDocument';
import { truncate } from '@/lib/various';
import { SourceHeader } from '../source/source-header';

function getContainerClass(layout) {
  if (layout === 'grid') return '';
  return 'grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-x-6 gap-y-3';
}

function getDetailsClass(layout) {
  if (layout === 'grid') return '';
  return 'lg:col-span-2';
}

interface ImageNewsCardProps {
  item: BaseDocument;
  layout: 'grid' | 'list';
  showType: boolean;
  isMultiSource: boolean;
}

export function ImageNewsCard({
  item,
  layout,
  showType,
  isMultiSource,
}: ImageNewsCardProps) {
  if (!item || !item.url) return null;
  const dict = getDictionary();

  return (
    <div className="">
      <div>
        {isMultiSource && (
          <SourceHeader item={item} showDate={true} isSmall={true} />
        )}
        {item.image?.thumbnailUrl && (
          <div className="mb-3 flex w-full items-center justify-center">
            <Link href={item.url} className="">
              <figure className="w-full">
                <Image
                  src={item.image?.thumbnailUrl}
                  className="w-full object-contain align-middle"
                  alt=""
                  width={400}
                  height={400}
                />
                {item.description && (
                  <figcaption className="mt-3">
                    <span className="font-serif text-base italic">
                      {item.description}
                    </span>
                    {item.primaryConstituent?.name && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {dict['news.cartoon.by']}{' '}
                        {item.primaryConstituent?.name}
                      </div>
                    )}
                  </figcaption>
                )}
              </figure>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
