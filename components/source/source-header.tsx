import Image from 'next/image';
import Link from 'next/link';
import { timeAgo } from '@/util/various';

import type { BaseDocument } from '@/types/baseDocument';

interface CardSourceHeaderProps {
  item: BaseDocument;
  showDate?: boolean;
  isSmall?: boolean;
}

export function SourceHeader({
  item,
  showDate = false,
  isSmall = false,
}: CardSourceHeaderProps) {
  if (!item || !item.source) return null;
  let containerClass = 'mb-2 flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-400';
  let imageContainerClass = 'relative mr-2 flex h-7 w-7 shrink-0 overflow-hidden rounded-full';
  if (isSmall) {
    containerClass = 'mb-2 flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-400'
    imageContainerClass = 'relative mr-2 flex h-6 w-6 shrink-0 overflow-hidden rounded-full';
  }

  return (
    <div className={containerClass}>
      <Link
        href={`/?f=true&source=${item.source}`}
        className="inline-flex items-center"
      >
        {item.sourceId && (
          <div className={imageContainerClass}>
            <Image
              src={`/img/logos/${item.sourceId}.jpg`}
              className="aspect-square h-full w-full"
              alt={item.source ? item.source : 'Logo'}
              width={400}
              height={400}
            />
          </div>
        )}
        {item.source}
      </Link>
      {showDate && item.date && (
        <div>{item.date ? timeAgo(item.date) : null}</div>
      )}
    </div>
  );
}
