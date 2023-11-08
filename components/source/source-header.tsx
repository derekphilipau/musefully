import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { BaseDocument } from '@/types/document';
import { sources } from '@/config/sources';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/various';

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
  if (!item || !item.sourceId) return null;
  const dict = getDictionary();

  return (
    <div
      className={cn(
        'mb-2 flex items-center justify-between text-neutral-700 dark:text-neutral-400',
        isSmall ? 'text-xs' : 'text-sm'
      )}
    >
      <Link
        href={`/?f=true&source=${sources[item.sourceId]?.name}`}
        className="inline-flex items-center"
      >
        {item.sourceId && (
          <div
            className={cn(
              'relative mr-2 flex shrink-0 overflow-hidden rounded-full border border-neutral-300 dark:border-neutral-700',
              isSmall ? 'h-6 w-6' : 'h-7 w-7'
            )}
          >
            <Image
              src={`/img/logos/${item.sourceId}.jpg`}
              className="aspect-square"
              alt={item.sourceId ? sources[item.sourceId]?.name : 'Logo'}
              width={400}
              height={400}
            />
          </div>
        )}
        {sources[item.sourceId || '']?.name}
      </Link>
      {showDate && item.date && (
        <div>{item.date ? timeAgo(item.date) : null}</div>
      )}
    </div>
  );
}
