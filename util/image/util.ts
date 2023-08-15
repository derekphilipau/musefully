export type ImageSize = 's' | 'm' | 'l';
export type ImageType = 'webp' | 'jpg';

export function getImageURL(
  indexName: string,
  id: string,
  size: ImageSize,
  type: ImageType
): string {
  return `https://${process.env.IMAGE_DOMAIN}/${indexName}/${id}-${size}.${type}`;
}
