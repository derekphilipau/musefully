import { Key } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { ArtworkDocument } from '@/types/document';

interface DescriptionRowProps {
  name: string;
  value?: string;
  item?: ArtworkDocument;
  isLink?: boolean;
  link?: string;
}

export function DescriptionRow({
  name,
  value,
  item,
  isLink = false,
  link,
}: DescriptionRowProps) {
  const dict = getDictionary();
  const displayName = dict?.[`field.${name}`] || 'Unknown field';
  const searchUrl = '/art?';

  let val = value ? value : item?.[name];
  if (!name || !val || val.length === 0) return null;
  if (!Array.isArray(val)) val = [val];

  return (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2">
      <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
        {displayName}
      </dt>
      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
        {link &&
          val.map(
            (tag: string, i: Key) =>
              tag && (
                <>
                  <Link key={i} href={link} className="underline">
                    {tag}
                  </Link>
                  {i !== val.length - 1 ? ', ' : ''}
                </>
              )
          )}
        {isLink &&
          !link &&
          val.map(
            (tag: string, i: Key) =>
              tag && (
                <>
                  <Link
                    key={i}
                    href={`${searchUrl}${name}=${encodeURIComponent(tag)}`}
                    className="underline"
                  >
                    {tag}
                  </Link>
                  {i !== val.length - 1 ? ', ' : ''}
                </>
              )
          )}
        {!isLink &&
          !link &&
          val.map(
            (tag: string, i: Key) =>
              tag && (
                <span key={i}>{`${(i as number) > 0 ? ',  ' : ''}${tag}`}</span>
              )
          )}
      </dd>
    </div>
  );
}
