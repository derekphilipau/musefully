import Image from 'next/image';
import Link from 'next/link';

import type { BaseDocument } from '@/types/document';
import { Icons } from '@/components/icons';

interface RemoteImageProps {
  item: BaseDocument;
  imageClassName?: string;
}

export function RemoteImage({ item, imageClassName = 'h-48 object-contain' }: RemoteImageProps) {
  if (!item) return null;

  return (
    <div className="flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700">
      <figure>
        <Link href={item.url || ''}>
          {item.image?.thumbnailUrl ? (
            <Image
              src={item.image?.thumbnailUrl}
              className={imageClassName}
              alt=""
              width={400}
              height={400}
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center">
              <Icons.imageOff className="h-24 w-24 text-neutral-300 group-hover:text-neutral-400" />
              <span className="sr-only">Image Unavailable</span>
            </div>
          )}
          <figcaption></figcaption>
        </Link>
      </figure>
    </div>
  );
}
