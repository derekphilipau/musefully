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

function getFormattedDate(event, dict) {
  let startDate, endDate, formattedStartDate, formattedEndDate;
  if (event.date) {
    startDate = new Date(event.date);
    formattedStartDate = format(startDate, 'MMMM d, yyyy');
  }
  if (event.endDate) {
    endDate = new Date(event.endDate);
    formattedEndDate = format(endDate, 'MMMM d, yyyy');
  }
  const currentDate = new Date();

  if (startDate && endDate) {
    if (startDate <= currentDate && endDate > currentDate) {
      return `${dict["date.through"]} ${formattedEndDate}`;
    }
    return `${formattedStartDate} - ${formattedEndDate}`;
  }
  if (event.startDate) {
    return `${dict["date.starting"]} ${formattedStartDate}`;
  }
  if (event.endDate) {
    return `${dict["date.through"]} ${formattedEndDate}`;
  }
}

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
  const formattedDate = getFormattedDate(item, dict);

  return (
    <div className={getContainerClass(layout)}>
      <div>
        {isMultiSource && layout === LAYOUT_GRID && (
          <SourceHeader item={item} showDate={true} isSmall={true} />
        )}
        <div className="flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700">
          <Link href={item.url}>
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
                  <Icons.imageOff className="h-24 w-24 text-neutral-300 group-hover:text-neutral-400" />
                  <span className="sr-only">Image Unavailable</span>
                </div>
              )}
              <figcaption></figcaption>
            </figure>
          </Link>
        </div>
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
