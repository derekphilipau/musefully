import { Key } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { ArtworkDocument } from '@/types/artworkDocument';

interface DescriptionRowProps {
  name: string;
  item?: ArtworkDocument;
  idField?: string;
  valueField?: string;
  isLink?: boolean;
}

export function DescriptionRowObjectField({
  name,
  item,
  idField = 'id',
  valueField = 'name',
  isLink = false,
}: DescriptionRowProps) {
  const dict = getDictionary();
  const displayName = dict?.[`field.${name}.${valueField}`] || 'Unknown field';
  const searchUrl = '/art?';

  let nameValueObjects = item?.[name];
  if (!name || !nameValueObjects || nameValueObjects.length === 0) return null;
  if (!Array.isArray(nameValueObjects)) nameValueObjects = [nameValueObjects];

  return (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2">
      <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
        {displayName}
      </dt>
      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
        {isLink &&
          nameValueObjects.map(
            (nameValueObject: any, i: Key) =>
              nameValueObject && (
                isLink ? (
                  <>
                    <Link
                      key={i}
                      href={`${searchUrl}${name}=${nameValueObject[idField]}`}
                      className="underline"
                    >
                      {nameValueObject[valueField]}
                    </Link>
                    {i !== nameValueObjects.length - 1 ? ', ' : ''}
                  </>
                ) : (
                  <span key={i}>{`${i > 0 ? ',  ' : ''}${nameValueObject[valueField]}`}</span>
                )
          ))}        
      </dd>
    </div>
  );
}
