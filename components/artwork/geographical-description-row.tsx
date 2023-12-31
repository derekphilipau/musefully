import { Key } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { ArtworkDocument, DocumentGeographicalLocation } from '@/types/document';

interface DescriptionRowProps {
  item?: ArtworkDocument;
}

export function GeographicalDescriptionRow({ item }: DescriptionRowProps) {
  const dict = getDictionary();
  const displayName =
    dict?.[`field.geographicalLocations`] || 'Unknown field';
  const searchUrl = '/art?';

  let val = item?.geographicalLocations;
  if (val === undefined || val.length === 0) return null;

  // [{"id":5027,"name":"China","type":"Place manufactured"}]

  return (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2">
      <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
        {displayName}
      </dt>
      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
        {val.map(
          (geoLoc: DocumentGeographicalLocation, i: Key) =>
            geoLoc && (
              <span key={i}>
                {geoLoc.type}:{' '}
                <Link
                  href={`${searchUrl}primaryGeographicalLocation.name=${encodeURIComponent(geoLoc.name)}`}
                  className="underline"
                >
                  {`${geoLoc.name}${val && i !== val.length - 1 ? ',  ' : ''}`}
                </Link>
              </span>
            )
        )}
      </dd>
    </div>
  );
}
