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

interface ImageNewsCardProps {
  item: BaseDocument;
  showType: boolean;
}

function ImageNewsCardComponent({ item, showType }: ImageNewsCardProps) {
  const { searchParams, isMultiSource } = useSearch();
  const layout = searchParams.layout;

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

export const ImageNewsCard = memo(ImageNewsCardComponent);
