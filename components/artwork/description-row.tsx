import { Fragment, Key } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { ArtworkDocument } from '@/types/document';

interface DescriptionRowProps {
  name: string;
  value?: string | string[]; // Allow array for value prop too
  item?: ArtworkDocument;
  isLink?: boolean;
  link?: string; // Single link for all values if provided
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

  // Determine the initial value, preferring the 'value' prop
  let rawVal = value ?? item?.[name];

  // Ensure value is an array and filter out non-string or empty values
  const values = (Array.isArray(rawVal) ? rawVal : [rawVal]).filter(
    (v): v is string => typeof v === 'string' && v.length > 0
  );

  // If no valid name or values, render nothing
  if (!name || values.length === 0) {
    return null;
  }

  return (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2">
      <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
        {displayName}
      </dt>
      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
        {values.map((tag: string, index: number) => {
          let element: React.ReactNode;
          const key = `${name}-${tag}-${index}`; // More specific key

          if (link) {
            // Case 1: Explicit link provided (applies to all values)
            element = (
              <Link href={link} className="underline">
                {tag}
              </Link>
            );
          } else if (isLink) {
            // Case 2: Generate search link for each value
            const href = `${searchUrl}${name}=${encodeURIComponent(tag)}`;
            element = (
              <Link href={href} className="underline">
                {tag}
              </Link>
            );
          } else {
            // Case 3: Plain text
            element = <span>{tag}</span>;
          }

          // Render element with comma separator if needed
          return (
            <Fragment key={key}>
              {element}
              {index < values.length - 1 ? ', ' : ''}
            </Fragment>
          );
        })}
      </dd>
    </div>
  );
}
