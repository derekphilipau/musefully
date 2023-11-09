import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';
import { format } from 'date-fns';

import type { EventDocument } from '@/types/document';
import {
  LAYOUT_GRID,
} from '@/lib/elasticsearch/search/searchParams';
import type { LayoutType } from '@/lib/elasticsearch/search/searchParams';
import { Icons } from '@/components/icons';
import { SourceHeader } from '@/components/source/source-header';
import { RemoteImage } from '../image/remote-image';
import { getFormattedItemDates } from '@/lib/various';

function getContainerClass(layout) {
  if (layout === LAYOUT_GRID) return '';
  return 'grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-x-6 gap-y-3';
}

function getDetailsClass(layout) {
  if (layout === LAYOUT_GRID) return 'pt-3';
  return 'lg:col-span-2';
}

interface EventCardProps {
  item: EventDocument;
  layout: LayoutType;
  showType: boolean;
  isMultiSource: boolean;
}

export function EventCard({
  item,
  layout,
  showType,
  isMultiSource,
}: EventCardProps) {
  if (!item || !item.url) return null;
  const dict = getDictionary();
  const formattedDate = getFormattedItemDates(item, dict);

  return (
    <div className={getContainerClass(layout)}>
      <div>
        {isMultiSource && layout === LAYOUT_GRID && (
          <SourceHeader item={item} showDate={true} isSmall={true} />
        )}
        <RemoteImage item={item} />
      </div>
      <div className={getDetailsClass(layout)}>
        {isMultiSource && layout !== LAYOUT_GRID && (
          <SourceHeader item={item} />
        )}
        <Link href={item.url}>
          <h5 className="text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-600">
            {dict[`index.events.type.${item.type}`]}
          </h5>
          <h4 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-white">
            {item.title}
          </h4>
          {formattedDate && (
            <p className="text-xs font-normal text-neutral-700 dark:text-neutral-400">
              {formattedDate}
            </p>
          )}
        </Link>
      </div>
    </div>
  );
}
