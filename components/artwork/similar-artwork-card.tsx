import { memo } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { ArtworkDocument } from '@/types/document';
import { getArtworkUrlWithSlug } from '@/lib/various';
import { DocumentImage } from '../image/document-image';
import { SourceHeader } from '../source/source-header';

interface SimilarArtworkCardProps {
  item: ArtworkDocument;
  isMultiSource: boolean;
}

function SimilarArtworkCardComponent({
  item,
  isMultiSource,
}: SimilarArtworkCardProps) {
  if (!item || !item._id) return null;
  const dict = getDictionary();

  const primaryConstituentName =
    item.primaryConstituent?.name || 'Maker Unknown';
  const href = getArtworkUrlWithSlug(item._id, item.title);

  return (
    <div className="">
      {isMultiSource && <SourceHeader item={item} isSmall={true} />}
      <div className="flex items-center justify-center bg-neutral-200 text-neutral-300 hover:bg-neutral-300 hover:text-neutral-400  dark:bg-neutral-900 dark:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-700">
        <Link href={href}>
          <DocumentImage item={item} className="h-48 object-contain" />
        </Link>
      </div>
      <div className="pt-2">
        <Link href={href}>
          <h4 className="font-semibold text-neutral-900 dark:text-white">
            {item.title}
          </h4>
          <h5 className="text-sm text-neutral-900 dark:text-white">
            {primaryConstituentName}
          </h5>
          <p className="text-xs font-normal text-neutral-700 dark:text-neutral-400">
            {item.formattedDate}
          </p>
        </Link>
      </div>
    </div>
  );
}

export const SimilarArtworkCard = memo(SimilarArtworkCardComponent);
