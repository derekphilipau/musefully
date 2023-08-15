import { getDictionary } from '@/dictionaries/dictionaries';

import type { BaseDocument } from '@/types/baseDocument';
import { Icons } from '@/components/icons';

type ImageSize = 's' | 'm' | 'l';
type ImageType = 'webp' | 'jpg';

export function getImageURL(
  imageDomain: string,
  indexName: string,
  id: string,
  size: ImageSize,
  type: ImageType
): string {
  return `https://${imageDomain}/${indexName}/${id}-${size}.${type}`;
}

interface DocumentImageProps {
  item: BaseDocument;
  imageDomain: string;
  caption?: string;
  className?: string;
  size?: ImageSize;
}

export function DocumentImage({
  item,
  imageDomain,
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

  const fallbackSrc = getImageURL(imageDomain, indexName, id, 's', 'jpg');

  switch (size) {
    case 's':
      srcSet = `
        ${getImageURL(imageDomain, indexName, id, 's', 'webp')} 1x,
        ${getImageURL(imageDomain, indexName, id, 'm', 'webp')} 2x
      `;
      sizesValue = '(max-width: 600px) 300px'; // Adjust to medium (600px) on retina.
      break;
    case 'm':
      srcSet = `
        ${getImageURL(imageDomain, indexName, id, 'm', 'webp')} 1x,
        ${getImageURL(imageDomain, indexName, id, 'l', 'webp')} 2x
      `;
      sizesValue = '(max-width: 1200px) 600px'; // Adjust to large (1200px) on retina.
      break;
    case 'l':
      srcSet = getImageURL(imageDomain, indexName, id, 'l', 'webp');
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
            width={400}
            height={400}
          />
        </picture>
      ) : (
        <div className="flex h-48 w-full items-center justify-center">
          <Icons.imageOff className="h-24 w-24" />
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
