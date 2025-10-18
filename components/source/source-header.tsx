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
  const sourceMeta = sources[item.sourceId] || {};
  const displayName =
    sourceMeta.shortName || sourceMeta.name || item.source || item.sourceId;

  return (
    <div
      className={cn(
        'mb-2 flex items-center justify-between text-neutral-700 dark:text-neutral-400',
        isSmall ? 'text-xs' : 'text-sm'
      )}
    >
      <Link
        href={`/?source=${sources[item.sourceId]?.name}`}
        className="inline-flex items-center font-semibold"
      >
        <span className="line-clamp-1 uppercase tracking-wide">
          {displayName}
        </span>
      </Link>
      {showDate && item.date && (
        <div>{item.date ? timeAgo(item.date) : null}</div>
      )}
    </div>
  );
}
