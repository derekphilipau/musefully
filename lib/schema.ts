/**
 * Schema.org JSON-LD
 *
 * Functions to transform data into JSON-LD for Schema.org.
 * Currently only supports VisualArtwork.
 */
import { vi } from 'date-fns/locale';
import type { VisualArtwork, WithContext } from 'schema-dts';

import type { ArtworkDocument } from '@/types/document';

/**
 * Parse dimensions string into cm.
 * TODO: Improve.  Also need similar function when importing into Elasticsearch.
 *
 * @param dimensions Dimensions string. (BkM)
 * @returns Object with height, width, and depth in cm.
 */
function getDimensionsCM(dimensions: string | undefined) {
  // H x W x D
  /*
  FAILS:
  component (Gong structure): 94 1/2 × 44 × 33 in. (240 × 111.8 × 83.8 cm) component (chair or throne-like form): 60 × 47 × 47 in. (152.4 × 119.4 × 119.4 cm) overall (one component in front of the other - dims variable): 94 1/2 × 47 × 82 in. (240 × 119.4 × 208.3 cm) component (gong only): 3 × 27 1/2 in. (7.6 × 69.9 cm)
  */
  if (!dimensions || !(dimensions?.length > 0)) return {};
  const cm = dimensions.match(/\((.+?)\)/);
  if (cm?.length === 2) {
    const dim = cm[1].match(/\d+(\.\d{1,2})?/g);
    if (dim?.length === 1) return { height: dim[0] };
    if (dim?.length === 2) return { height: dim[0], width: dim[1] };
    if (dim?.length === 3)
      return { height: dim[0], width: dim[1], depth: dim[2] };
  }
  return {};
}

/**
 * Transform ArtworkDocument into Schema.org VisualArtwork JSON-LD.
 *
 * https://schema.org/VisualArtwork
 *
 * @param item ArtworkDocument
 * @returns Schema.org VisualArtwork JSON-LD
 */
export function getSchemaVisualArtwork(item: ArtworkDocument | undefined) {
  if (!item) return;
  const schema: WithContext<VisualArtwork> = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
  };
  if (item.title) schema.name = item.title;
  if (item.image?.thumbnailUrl) schema.image = item.image?.thumbnailUrl;
  if (item.description) schema.abstract = item.description;
  if (item.primaryConstituent?.name) {
    schema.creator = [
      {
        '@type': 'Person',
        name: item.primaryConstituent.canonicalName,
      },
    ];
  }
  if (item.medium) schema.artMedium = item.medium;
  if (item.classification) schema.artform = item.classification;
  const dimensions = getDimensionsCM(item.dimensions);
  if (dimensions?.height)
    schema.height = [{ '@type': 'Distance', name: `${dimensions.height} cm` }];
  if (dimensions?.width)
    schema.width = [{ '@type': 'Distance', name: `${dimensions.width} cm` }];
  if (dimensions?.depth)
    schema.depth = [{ '@type': 'Distance', name: `${dimensions.depth} cm` }];
  schema.accessMode = 'visual'; // TODO
  if (item.copyright) schema.copyrightNotice = item.copyright;
  if (item.creditLine) schema.creditText = item.creditLine;
  if (item.formattedDate) schema.dateCreated = item.formattedDate; // TODO
  schema.inLanguage = 'English'; // TODO
  if (item.keywords) schema.keywords = item.keywords;
  return schema;
}

export function getSchemaVisualArtworkJson(item: ArtworkDocument | undefined) {
  const visualArtwork = getSchemaVisualArtwork(item);
  if (!visualArtwork) return;
  return JSON.stringify(visualArtwork, null, 2);
}
