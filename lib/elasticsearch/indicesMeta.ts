/**
 * Metadata for each index.
 */

/**
 * The metadata for each index.
 *
 * @property [index] - The name of the index.
 * @property [index].aggs - The aggregations that are available for this index.
 */
interface IndicesMeta {
  [index: string]: {
    aggs: string[];
    filters: string[];
  };
}

/**
 * The metadata for each index.
 *
 * @property art - The metadata for the art index.
 * @property news - The metadata for the news index.
 */
export const indicesMeta: IndicesMeta = {
  art: {
    aggs: [
      'source',
      'primaryConstituent.canonicalName',
      'classification',
      'medium',
      'departments',
      'period',
      'dynasty',
      'primaryGeographicalLocation.continent',
      'primaryGeographicalLocation.country',
      'primaryGeographicalLocation.name',
      'museumLocation.name',
      'exhibitions',
      'section',
    ],
    filters: [
      // not all aggs need to be filters
      'source',
      'primaryConstituent.canonicalName',
      'classification',
      'medium',
      'departments',
      'period',
      'dynasty',
      'primaryGeographicalLocation.continent',
      'primaryGeographicalLocation.country',
      'primaryGeographicalLocation.name',
      'museumLocation.name',
      'exhibitions',
      'section',
      // non-agg filters:
      'isUnrestricted',
      'hasPhoto',
      'onView',
    ],
  },
  news: {
    aggs: ['source'],
    filters: ['source'],
  },
  events: {
    aggs: ['source', 'location'],
    filters: ['source', 'location'],
  },
  all: {
    aggs: ['source'],
    filters: ['source'],
  },
};
