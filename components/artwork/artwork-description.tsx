import * as React from 'react';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { ArtworkDocument } from '@/types/artworkDocument';
import { DominantColors } from '@/components/color/dominant-colors';
import { DescriptionRow } from './description-row';
import { GeographicalDescriptionRow } from './geographical-description-row';

interface ArtworkDescriptionProps {
  item: ArtworkDocument;
}

export function ArtworkDescription({
  item,
}: ArtworkDescriptionProps) {
  if (!item?.id) return null;
  const dict = getDictionary();

  const primaryConstituentName =
    item.primaryConstituent?.canonicalName || 'Maker Unknown';

  //  http://localhost:3000/art?hasPhoto=true&f=true&startYear=2014&endYear=2014
  const startYear = item.startYear;
  const endYear = item.endYear || item.startYear;
  let dateLink = '';
  if (startYear && endYear) {
    dateLink = `/art?hasPhoto=true&f=true&startYear=${item.startYear}&endYear=${item.endYear}`;
  }

  return (
    <div className="mt-5 border-t border-gray-200">
      <dl className="divide-y divide-gray-200">
        <DescriptionRow
          name="primaryConstituent.canonicalName"
          value={primaryConstituentName}
          isLink={true}
        />
        <DescriptionRow name="classification" item={item} isLink={true} />
        <DescriptionRow name="formattedMedium" item={item} isLink={false} />
        <DescriptionRow name="medium" item={item} isLink={true} />
        <GeographicalDescriptionRow item={item} />
        {dateLink && <DescriptionRow name="date" item={item} link={dateLink} />}
        {!dateLink && <DescriptionRow name="date" item={item} />}
        <DescriptionRow name="dynasty" item={item} isLink={true} />
        <DescriptionRow name="period" item={item} isLink={true} />
        <DescriptionRow name="dimensions" item={item} />
        <DescriptionRow name="signed" item={item} />
        <DescriptionRow name="inscribed" item={item} />
        <DescriptionRow name="departments" item={item} isLink={true} />
        <DescriptionRow name="accessionNumber" item={item} />
        <DescriptionRow name="creditLine" item={item} />
        <DescriptionRow name="exhibitions" item={item} isLink={true} />
        <DescriptionRow name="rightsType" item={item} />
        <DescriptionRow
          name="museumLocation.name"
          value={item.museumLocation?.name}
          isLink={true}
        />
        {item?.image?.dominantColors?.length && (
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2">
            <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {dict['field.dominantColors']}
            </dt>
            <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
              <DominantColors item={item} height={40} />
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
