import Image from 'next/image';
import { getDictionary } from '@/dictionaries/dictionaries';

import { Icons } from '@/components/icons';

export function CollectionObjectThumbnail({ item }) {
  if (!item) return null;
  const dict = getDictionary();

  return (
    <figure>
      {item.image?.thumbnailUrl ? (
        <Image
          src={item.image?.thumbnailUrl}
          className="h-48 object-contain"
          alt={`${dict['index.collections.altText']} ${item.title}`}
          width={400}
          height={400}
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center">
          <Icons.imageOff className="h-24 w-24" />
          <span className="sr-only">{dict['search.imageUnavailable']}</span>
        </div>
      )}
      <figcaption></figcaption>
    </figure>
  );
}
