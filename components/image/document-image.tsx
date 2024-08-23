import { getDictionary } from '@/dictionaries/dictionaries';

import type { BaseDocument } from '@/types/document';
import { Icons } from '@/components/icons';

type ImageSize = 's' | 'm' | 'l';
type ImageType = 'webp' | 'jpg';

export function getImageURL(
  indexName: string,
  id: string,
  size: ImageSize,
  type: ImageType
): string {
  return `https://${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/${indexName}/${id}-${size}.${type}`;
}

interface DocumentImageProps {
  item: BaseDocument;
  caption?: string;
  className?: string;
  size?: ImageSize;
}

export function DocumentImage({
  item,
  caption,
  className,
  size = 's',
}: DocumentImageProps) {
  if (!item || !item._index || !item._id) return null;
  const indexName = item._index;
  const id = item._id;
  const dict = getDictionary();

  let srcSet = '';
  let sizesValue = '';

  const fallbackSrc = getImageURL(indexName, id, 's', 'jpg');

  switch (size) {
    case 's':
      srcSet = `
        ${getImageURL(indexName, id, 's', 'webp')} 1x,
        ${getImageURL(indexName, id, 'm', 'webp')} 2x
      `;
      sizesValue = '(max-width: 600px) 300px'; // Adjust to medium (600px) on retina.
      break;
    case 'm':
      srcSet = `
        ${getImageURL(indexName, id, 'm', 'webp')} 1x,
        ${getImageURL(indexName, id, 'l', 'webp')} 2x
      `;
      sizesValue = '(max-width: 1200px) 600px'; // Adjust to large (1200px) on retina.
      break;
    case 'l':
      srcSet = getImageURL(indexName, id, 'l', 'webp');
      sizesValue = '';
      break;
  }

  return (
    <figure>
      {item.image?.thumbnailUrl ? (
        <picture className="flex items-center justify-center">
          <source type="image/webp" sizes={sizesValue} srcSet={srcSet} />
          <img
            src={fallbackSrc}
            className={className}
            alt={`${dict['index.art.altText']} ${item.title}`}
            width={300}
            height={300}
          />
        </picture>
      ) : (
        <div className="flex h-48 w-full items-center justify-center">
          <Icons.imageOff className="size-24" />
          <span className="sr-only">{dict['search.imageUnavailable']}</span>
        </div>
      )}
      {caption && (
        <figcaption className="mt-4 text-xs italic text-neutral-500 dark:text-neutral-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
